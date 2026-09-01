/**
 * ============================================================================
 * CENTRAL SUPABASE REALTIME SERVICE
 * โรงเรียนวัดบางโฉลงใน (Wat Bang Chalong Nai School)
 * ============================================================================
 * 
 * Implements a Unified Dual-Engine Realtime Architecture:
 * 1. PostgreSQL Changes Listener (`postgres_changes` on public schema)
 * 2. Instant Cross-Browser Broadcast Channel (`bangchalong_system_sync`)
 * 
 * Features:
 * - Realtime updates across Admin, Teacher, and Committee browsers without refresh
 * - Deduplication of rapid events to prevent duplicate renders and race conditions
 * - Complete automatic cleanup on component unmount (prevents memory leaks)
 * - Safe reconnection on network recovery
 * - Atomic event dispatching
 */

import { getSupabaseClient } from './supabaseClient';

export type RealtimeAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface RealtimeEventPayload {
  table: string;
  action: RealtimeAction;
  data?: any;
  id?: string;
  timestamp: number;
}

export type TableChangeCallback = (
  table: string,
  eventType: RealtimeAction,
  newRecord?: any,
  oldRecord?: any
) => void;

const SYNC_CHANNEL_NAME = 'bangchalong_system_sync';
let activeSyncChannel: any = null;
let registeredCallbacks: Set<TableChangeCallback> = new Set();
let tableSubscriptions: Map<string, Set<(payload: any) => void>> = new Map();
const recentEventSignatures: Map<string, number> = new Map();

/**
 * Deduplicates events occurring within 300ms
 */
function shouldProcessEvent(signature: string): boolean {
  const now = Date.now();
  const lastTime = recentEventSignatures.get(signature) || 0;
  if (now - lastTime < 300) {
    return false;
  }
  recentEventSignatures.set(signature, now);

  // Cleanup old signatures periodically
  if (recentEventSignatures.size > 200) {
    for (const [k, t] of recentEventSignatures.entries()) {
      if (now - t > 5000) {
        recentEventSignatures.delete(k);
      }
    }
  }
  return true;
}

/**
 * Initializes the Central Realtime Broadcast Channel & PostgreSQL Listeners
 */
function ensureCentralChannel() {
  const supabase = getSupabaseClient();
  if (!supabase || activeSyncChannel) return;

  try {
    activeSyncChannel = supabase.channel(SYNC_CHANNEL_NAME, {
      config: {
        broadcast: { ack: true, self: true },
        presence: { key: 'client_' + Math.random().toString(36).substring(2, 8) }
      }
    });

    // 1. Listen to Cross-Browser Broadcast mutations
    activeSyncChannel.on('broadcast', { event: 'data_mutation' }, ({ payload }: { payload: RealtimeEventPayload }) => {
      if (!payload || !payload.table) return;
      const signature = `broadcast_${payload.table}_${payload.action}_${payload.id || JSON.stringify(payload.data?.id || '')}`;
      if (!shouldProcessEvent(signature)) return;

      console.info(`[Realtime Broadcast] Received ${payload.action} on ${payload.table}:`, payload.id || payload.data?.id);

      // Notify global callbacks
      registeredCallbacks.forEach(cb => {
        try {
          cb(payload.table, payload.action, payload.data, { id: payload.id });
        } catch (e) {
          console.warn('[Realtime Broadcast] Callback error:', e);
        }
      });

      // Notify table-specific listeners
      const listeners = tableSubscriptions.get(payload.table);
      if (listeners) {
        listeners.forEach(cb => {
          try {
            cb({
              eventType: payload.action,
              new: payload.action !== 'DELETE' ? payload.data : null,
              old: payload.action !== 'INSERT' ? (payload.data || { id: payload.id }) : null
            });
          } catch (e) {
            console.warn(`[Realtime Table ${payload.table}] Listener error:`, e);
          }
        });
      }
    });

    // 2. Listen to PostgreSQL DB changes on all public tables
    activeSyncChannel.on(
      'postgres_changes',
      { event: '*', schema: 'public' },
      (payload: any) => {
        const table = payload.table;
        const eventType = payload.eventType as RealtimeAction;
        const id = payload.new?.id || payload.old?.id || '';
        const signature = `pg_${table}_${eventType}_${id}`;
        if (!shouldProcessEvent(signature)) return;

        console.info(`[Realtime Postgres] Received ${eventType} on ${table}:`, id);

        registeredCallbacks.forEach(cb => {
          try {
            cb(table, eventType, payload.new, payload.old);
          } catch (e) {
            console.warn('[Realtime Postgres] Callback error:', e);
          }
        });

        const listeners = tableSubscriptions.get(table);
        if (listeners) {
          listeners.forEach(cb => {
            try {
              cb(payload);
            } catch (e) {
              console.warn(`[Realtime Table ${table}] Listener error:`, e);
            }
          });
        }
      }
    );

    activeSyncChannel.subscribe((status: string) => {
      if (status === 'SUBSCRIBED') {
        console.info('[Realtime] Central sync channel active & connected');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        console.warn('[Realtime] Channel status changed to:', status);
      }
    });
  } catch (err) {
    console.warn('[Realtime] Failed to initialize central channel:', err);
  }
}

/**
 * Broadcasts a mutation immediately to all connected browsers and local listeners
 */
export async function broadcastMutation(
  table: string,
  action: RealtimeAction,
  data?: any,
  id?: string
): Promise<void> {
  const payload: RealtimeEventPayload = {
    table,
    action,
    data,
    id: id || data?.id,
    timestamp: Date.now()
  };

  // 1. Immediately dispatch to local listeners
  const signature = `broadcast_${table}_${action}_${id || JSON.stringify(data?.id || '')}`;
  if (shouldProcessEvent(signature)) {
    registeredCallbacks.forEach(cb => {
      try {
        cb(table, action, data, { id: id || data?.id });
      } catch (e) {
        console.warn('[Realtime Broadcast] Local callback error:', e);
      }
    });

    const listeners = tableSubscriptions.get(table);
    if (listeners) {
      listeners.forEach(cb => {
        try {
          cb(payload);
        } catch (e) {
          console.warn(`[Realtime Broadcast] Local listener error for ${table}:`, e);
        }
      });
    }
  }

  // 2. Broadcast across all network browsers via Supabase Realtime channel
  const supabase = getSupabaseClient();
  if (!supabase) return;

  ensureCentralChannel();

  try {
    if (activeSyncChannel) {
      await activeSyncChannel.send({
        type: 'broadcast',
        event: 'data_mutation',
        payload
      });
    }
  } catch (err) {
    console.warn(`[Realtime] Failed to broadcast mutation on ${table}:`, err);
  }
}

/**
 * Subscribes to all Realtime changes across the application
 */
export function subscribeToAllRealtime(callback: TableChangeCallback): () => void {
  ensureCentralChannel();
  registeredCallbacks.add(callback);

  return () => {
    registeredCallbacks.delete(callback);
    if (registeredCallbacks.size === 0 && tableSubscriptions.size === 0 && activeSyncChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(activeSyncChannel);
      }
      activeSyncChannel = null;
    }
  };
}

/**
 * Subscribes to a specific table's Realtime changes
 */
export function subscribeToTableRealtime(
  table: string,
  onUpdate: (payload: any) => void
): () => void {
  ensureCentralChannel();

  if (!tableSubscriptions.has(table)) {
    tableSubscriptions.set(table, new Set());
  }
  tableSubscriptions.get(table)!.add(onUpdate);

  return () => {
    const set = tableSubscriptions.get(table);
    if (set) {
      set.delete(onUpdate);
      if (set.size === 0) {
        tableSubscriptions.delete(table);
      }
    }
    if (registeredCallbacks.size === 0 && tableSubscriptions.size === 0 && activeSyncChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(activeSyncChannel);
      }
      activeSyncChannel = null;
    }
  };
}
