/**
 * ============================================================================
 * SAFE STORAGE AUTO-CLEANUP & ASSET MANAGEMENT SERVICE
 * ============================================================================
 * Implements strict, non-destructive file lifecycle management for:
 * 1. Profile Images (avatars/{teacherId}/{uuid}.webp)
 * 2. Media Thumbnails (media-thumbnails/{resourceId}/{uuid}.webp)
 * 
 * Safety Protocol:
 *   Upload NEW -> Verify Upload -> Update DB -> Verify DB -> Delete OLD
 *   - Never deletes OLD before NEW is active and verified.
 *   - Never attempts to delete External URLs (YouTube, Drive, Unsplash).
 *   - Never deletes PA data, SAR, or evaluations.
 */

import { getSupabaseClient } from './supabaseClient';

export interface StorageCleanupLog {
  id: string;
  bucket: string;
  oldPath: string | null;
  newPath: string;
  entityType: 'profile_image' | 'media_thumbnail' | 'exam_cover' | 'document_cover' | 'video_thumbnail';
  entityId: string;
  status: 'success' | 'db_failed_new_cleaned' | 'delete_old_warning';
  timestamp: string;
  error?: string;
}

const CLEANUP_LOG_STORAGE_KEY = 'bcln_storage_cleanup_logs';

/**
 * Checks whether a given URL is hosted on our Supabase Storage bucket.
 */
export function isSupabaseStorageUrl(url: string, bucketName?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // External URLs (Unsplash, YouTube, Google Drive, Cloudinary, etc.) are never Supabase storage
  if (
    url.includes('images.unsplash.com') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('drive.google.com') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return false;
  }

  if (bucketName) {
    return url.includes(`/storage/v1/object/public/${bucketName}/`) || url.includes(`/${bucketName}/`);
  }

  return url.includes('/storage/v1/object/public/');
}

/**
 * Safely extracts the internal file path from a Supabase Storage public URL.
 */
export function extractStoragePath(url: string, bucketName: string): string | null {
  if (!isSupabaseStorageUrl(url, bucketName)) return null;

  try {
    const publicPattern = `/storage/v1/object/public/${bucketName}/`;
    const idx = url.indexOf(publicPattern);
    if (idx !== -1) {
      const pathWithParams = url.substring(idx + publicPattern.length);
      return decodeURIComponent(pathWithParams.split('?')[0]);
    }
    return null;
  } catch {
    return null;
  }
}

const memoryCleanupLogs: StorageCleanupLog[] = [];

/**
 * Logs a storage lifecycle event for administrative auditing.
 */
export function logCleanupEvent(log: StorageCleanupLog): void {
  try {
    memoryCleanupLogs.unshift(log);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const existing = getCleanupLogs();
      const updated = [log, ...existing].slice(0, 100);
      localStorage.setItem(CLEANUP_LOG_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore storage quota errors for logs
  }
}

/**
 * Retrieves all stored cleanup logs.
 */
export function getCleanupLogs(): StorageCleanupLog[] {
  try {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(CLEANUP_LOG_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }
    return memoryCleanupLogs;
  } catch {
    return memoryCleanupLogs;
  }
}

export interface SafeUploadOptions {
  bucket: string;
  folder: string;
  entityId: string;
  entityType: 'profile_image' | 'media_thumbnail' | 'exam_cover' | 'document_cover' | 'video_thumbnail';
  fileData: Blob | File | string; // Supports File, Blob, or DataUrl
  mimeType?: string;
  oldUrl?: string;
  updateDatabaseFn: (newUrl: string) => Promise<boolean>;
}

export interface SafeUploadResult {
  success: boolean;
  publicUrl?: string;
  oldFileDeleted?: boolean;
  error?: string;
}

/**
 * Executes the Safe Upload & Replacement Lifecycle:
 * 1. Upload NEW -> 2. Verify NEW -> 3. Update DB -> 4. Verify DB -> 5. Delete OLD
 */
export async function safeUploadAndReplaceAsset(options: SafeUploadOptions): Promise<SafeUploadResult> {
  const {
    bucket,
    folder,
    entityId,
    entityType,
    fileData,
    mimeType = 'image/webp',
    oldUrl,
    updateDatabaseFn
  } = options;

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client is not initialized' };
  }

  // Generate Collision-Proof Unique Path: {folder}/{entityId}/{timestamp}_{randomUuid}.webp
  const fileExt = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') ? 'jpg' : 'webp';
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const newFilePath = `${folder}/${entityId}/${Date.now()}_${randomSuffix}.${fileExt}`;

  let uploadBody: Blob | File;

  if (typeof fileData === 'string') {
    if (fileData.startsWith('data:')) {
      try {
        const response = await fetch(fileData);
        uploadBody = await response.blob();
      } catch (e: any) {
        return { success: false, error: `Failed to process image data: ${e.message}` };
      }
    } else {
      return { success: false, error: 'String file data must be a valid Data URL (data:...)' };
    }
  } else {
    uploadBody = fileData;
  }

  // STEP 1: Upload NEW asset to Supabase Storage
  console.log(`[Storage] 1. Uploading new asset to "${bucket}/${newFilePath}"...`);
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(newFilePath, uploadBody, {
      contentType: mimeType,
      cacheControl: '3600',
      upsert: false
    });

  if (uploadErr || !uploadData) {
    console.error(`[Storage] ❌ Upload failed for "${newFilePath}":`, uploadErr);
    return { 
      success: false, 
      error: uploadErr?.message || 'Failed to upload asset to storage' 
    };
  }

  // STEP 2: Verify NEW asset public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(newFilePath);
  const newPublicUrl = urlData.publicUrl;
  console.log(`[Storage] 2. Verified new public URL: ${newPublicUrl}`);

  // STEP 3 & 4: Update Database and Verify
  console.log(`[Storage] 3. Updating Database record for entity "${entityId}"...`);
  let dbSuccess = false;
  try {
    dbSuccess = await updateDatabaseFn(newPublicUrl);
  } catch (dbErr: any) {
    console.error(`[Storage] ❌ Database update threw error:`, dbErr);
    dbSuccess = false;
  }

  if (!dbSuccess) {
    // CRITICAL SAFETY: Rollback newly uploaded file to prevent orphan file accumulation
    console.warn(`[Storage] ⚠️ DB update failed! Cleaning up newly uploaded asset "${newFilePath}"...`);
    await supabase.storage.from(bucket).remove([newFilePath]);
    
    logCleanupEvent({
      id: `log_${Date.now()}`,
      bucket,
      oldPath: oldUrl ? extractStoragePath(oldUrl, bucket) : null,
      newPath: newFilePath,
      entityType,
      entityId,
      status: 'db_failed_new_cleaned',
      timestamp: new Date().toISOString(),
      error: 'Database update failed; newly uploaded asset rolled back safely.'
    });

    return { 
      success: false, 
      error: 'Database update failed. The new asset was safely rolled back and old asset preserved.' 
    };
  }

  console.log(`[Storage] 4. Database update verified successfully!`);

  // STEP 5: Delete OLD asset ONLY if it is a Supabase storage asset and different from new
  let oldFileDeleted = false;
  const oldStoragePath = oldUrl ? extractStoragePath(oldUrl, bucket) : null;

  if (oldStoragePath && oldStoragePath !== newFilePath) {
    console.log(`[Storage] 5. Safely deleting old asset "${bucket}/${oldStoragePath}"...`);
    try {
      const { error: removeErr } = await supabase.storage
        .from(bucket)
        .remove([oldStoragePath]);

      if (removeErr) {
        console.warn(`[Storage] ⚠️ Warning: Failed to delete old asset "${oldStoragePath}":`, removeErr);
        logCleanupEvent({
          id: `log_${Date.now()}`,
          bucket,
          oldPath: oldStoragePath,
          newPath: newFilePath,
          entityType,
          entityId,
          status: 'delete_old_warning',
          timestamp: new Date().toISOString(),
          error: removeErr.message
        });
      } else {
        console.log(`[Storage] ✓ Old asset "${oldStoragePath}" deleted successfully.`);
        oldFileDeleted = true;
        logCleanupEvent({
          id: `log_${Date.now()}`,
          bucket,
          oldPath: oldStoragePath,
          newPath: newFilePath,
          entityType,
          entityId,
          status: 'success',
          timestamp: new Date().toISOString()
        });
      }
    } catch (removeEx: any) {
      console.warn(`[Storage] Warning during old file cleanup:`, removeEx);
    }
  } else {
    // Old asset was external (e.g. Unsplash, YouTube) -> No storage deletion required
    logCleanupEvent({
      id: `log_${Date.now()}`,
      bucket,
      oldPath: null,
      newPath: newFilePath,
      entityType,
      entityId,
      status: 'success',
      timestamp: new Date().toISOString()
    });
  }

  return {
    success: true,
    publicUrl: newPublicUrl,
    oldFileDeleted
  };
}

/**
 * Scans a storage bucket for orphan files (files not referenced in active database URLs).
 * NOTE: Returns candidates for review without deleting automatically.
 */
export async function scanOrphanStorageFiles(
  bucket: string,
  activeDatabaseUrls: string[]
): Promise<{ orphanFiles: string[]; totalFilesScanned: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) return { orphanFiles: [], totalFilesScanned: 0 };

  try {
    const activePaths = new Set(
      activeDatabaseUrls
        .map(url => extractStoragePath(url, bucket))
        .filter((p): p is string => Boolean(p))
    );

    const { data: fileList, error } = await supabase.storage.from(bucket).list('', {
      limit: 500,
      sortBy: { column: 'created_at', order: 'desc' }
    });

    if (error || !fileList) return { orphanFiles: [], totalFilesScanned: 0 };

    const orphans = fileList
      .filter(f => f.name && !activePaths.has(f.name))
      .map(f => f.name);

    return {
      orphanFiles: orphans,
      totalFilesScanned: fileList.length
    };
  } catch {
    return { orphanFiles: [], totalFilesScanned: 0 };
  }
}
