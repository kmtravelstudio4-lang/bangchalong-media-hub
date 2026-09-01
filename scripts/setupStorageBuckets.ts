/**
 * ============================================================================
 * SUPABASE STORAGE BUCKETS PROVISIONING SCRIPT
 * ============================================================================
 * Creates standard storage buckets with public read access:
 * 1. avatars (for teacher profile pictures)
 * 2. media-thumbnails (for resource cover images)
 * 3. media (for educational files)
 * 4. documents (for school documents & forms)
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const REQUIRED_BUCKETS = [
  { id: 'avatars', name: 'avatars', public: true },
  { id: 'media-thumbnails', name: 'media-thumbnails', public: true },
  { id: 'media', name: 'media', public: true },
  { id: 'documents', name: 'documents', public: true }
];

async function setupBuckets() {
  console.log('============================================================');
  console.log('🪣 PROVISIONING SUPABASE STORAGE BUCKETS');
  console.log('============================================================\n');

  const { data: existingBuckets } = await supabase.storage.listBuckets();
  const existingSet = new Set((existingBuckets || []).map(b => b.id));

  for (const b of REQUIRED_BUCKETS) {
    if (existingSet.has(b.id)) {
      console.log(`  ✓ Bucket "${b.id}" already exists`);
    } else {
      console.log(`  -> Creating bucket "${b.id}" (Public: ${b.public})...`);
      const { error } = await supabase.storage.createBucket(b.id, {
        public: b.public,
        fileSizeLimit: 52428800 // 50MB
      });

      if (error) {
        console.warn(`     ⚠️ Notice: ${error.message}`);
      } else {
        console.log(`     ✓ Created bucket "${b.id}"`);
      }
    }
  }

  const { data: finalBuckets } = await supabase.storage.listBuckets();
  console.log('\nFinal Storage Buckets in Supabase:');
  finalBuckets?.forEach(b => console.log(`  - [${b.id}] Public: ${b.public}`));
  console.log('============================================================');
}

setupBuckets().catch(console.error);
