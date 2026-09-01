import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_CONFIG = 'wat_bang_chalong_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

/**
 * Retrieve Supabase configuration from localStorage or Vite environment variables.
 */
export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
    ''
  ).trim();
  const envKey = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    ''
  ).trim();

  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        const url = (parsed.url || envUrl || '').trim();
        const anonKey = (parsed.anonKey || envKey || '').trim();
        return {
          url,
          anonKey,
          isConnected: Boolean(url && anonKey)
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse Supabase config from localStorage:', e);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    isConnected: Boolean(envUrl && envKey)
  };
}

/**
 * Save custom Supabase credentials to localStorage.
 */
export function saveSupabaseConfig(config: { url: string; anonKey: string }): SupabaseConfig {
  const newConfig: SupabaseConfig = {
    url: config.url.trim(),
    anonKey: config.anonKey.trim(),
    isConnected: Boolean(config.url.trim() && config.anonKey.trim())
  };

  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
  } catch (e) {
    console.error('Error saving Supabase config to localStorage:', e);
  }

  // Reset client instance so it re-initializes with new config
  cachedClient = null;
  return newConfig;
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

/**
 * Get or initialize the Supabase client.
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  const currentKey = `${config.url}::${config.anonKey}`;
  if (cachedClient && lastClientKey === currentKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastClientKey = currentKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}
