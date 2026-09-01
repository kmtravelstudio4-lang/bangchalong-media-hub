/**
 * Image Compression Utility for Teachers' Media Covers & Profile Avatars
 * 
 * Compresses images client-side via HTML5 Canvas before saving or uploading:
 * - Downscales large photos (e.g. 5-12 MB phone camera photos) to max 640x480 / 800x600 px
 * - Converts to optimized WebP / JPEG with 0.72 quality
 * - Reduces file size by 95% - 99% (typically from 5 MB to ~25-45 KB)
 * - Drastically saves Firestore / database storage and delivers blazing-fast load speeds!
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savingsPercentage: number;
  width: number;
  height: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: 'image/webp' | 'image/jpeg';
  targetMaxBytes?: number; // Target max size in bytes (e.g. 150KB for profile, 200KB for media, 100KB for exam cover)
  mode?: 'profile' | 'thumbnail' | 'exam_cover' | 'custom';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Compresses a File or Blob client-side using Adaptive Multi-Pass Ultra Compression:
 * - Profile targets: max 320x320 px square, ≤ 35 KB (Ultra-compact 1:1 crop, WebP)
 * - Media Thumbnail targets: max 800x800 px, ≤ 200 KB (Adaptive quality 0.82 -> 0.50)
 * - Exam Cover targets: max 800x600 px, ≤ 100 KB (Adaptive quality 0.80 -> 0.45)
 * - Strips all EXIF / GPS / camera metadata
 * - Converts to optimized WebP (with JPEG fallback)
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const mode = options.mode || 'thumbnail';
  const defaultMaxDim = mode === 'profile' ? 320 : 800;
  const defaultTargetBytes = mode === 'profile' 
    ? 35 * 1024 
    : mode === 'exam_cover' 
      ? 100 * 1024 
      : 200 * 1024;

  let maxW = options.maxWidth || defaultMaxDim;
  let maxH = options.maxHeight || (mode === 'exam_cover' ? 600 : (mode === 'profile' ? 320 : defaultMaxDim));
  const targetBytes = options.targetMaxBytes || defaultTargetBytes;
  const preferredMime = options.mimeType || 'image/webp';

  const originalSizeBytes = file.size;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      const img = new Image();
      img.src = readerEvent.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas 2d context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        let currentW = img.width;
        let currentH = img.height;

        if (mode === 'profile') {
          // Center-crop 1:1 square for perfect avatar circle/square fit
          const minSide = Math.min(img.width, img.height);
          const startX = Math.round((img.width - minSide) / 2);
          const startY = Math.round((img.height - minSide) / 2);
          const finalDim = Math.min(maxW, 320, minSide);

          canvas.width = finalDim;
          canvas.height = finalDim;
          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, finalDim, finalDim);

          currentW = finalDim;
          currentH = finalDim;
        } else {
          // Downscale to fit within initial bounding box
          if (currentW > currentH) {
            if (currentW > maxW) {
              currentH = Math.round((currentH * maxW) / currentW);
              currentW = maxW;
            }
          } else {
            if (currentH > maxH) {
              currentW = Math.round((currentW * maxH) / currentH);
              currentH = maxH;
            }
          }

          canvas.width = currentW;
          canvas.height = currentH;
          ctx.drawImage(img, 0, 0, currentW, currentH);
        }

        // Adaptive Multi-pass Compression: try qualities
        const qualities = mode === 'profile' 
          ? [options.quality || 0.75, 0.65, 0.55, 0.45] 
          : [options.quality || 0.80, 0.70, 0.60, 0.50];
        let bestDataUrl = '';
        let finalSizeBytes = 0;

        for (const q of qualities) {
          let testUrl = canvas.toDataURL(preferredMime, q);
          if (preferredMime === 'image/webp' && !testUrl.startsWith('data:image/webp')) {
            testUrl = canvas.toDataURL('image/jpeg', q);
          }

          const base64Len = testUrl.length - (testUrl.indexOf(',') + 1);
          const currentSize = Math.round((base64Len * 3) / 4);

          bestDataUrl = testUrl;
          finalSizeBytes = currentSize;

          if (currentSize <= targetBytes) {
            break;
          }
        }

        // If still larger than target, perform one resolution reduction step
        if (finalSizeBytes > targetBytes && (currentW > 400 || currentH > 400)) {
          const stepW = Math.round(currentW * 0.8);
          const stepH = Math.round(currentH * 0.8);
          canvas.width = stepW;
          canvas.height = stepH;
          ctx.drawImage(img, 0, 0, stepW, stepH);

          let stepUrl = canvas.toDataURL(preferredMime, 0.65);
          if (preferredMime === 'image/webp' && !stepUrl.startsWith('data:image/webp')) {
            stepUrl = canvas.toDataURL('image/jpeg', 0.65);
          }
          const base64Len = stepUrl.length - (stepUrl.indexOf(',') + 1);
          bestDataUrl = stepUrl;
          finalSizeBytes = Math.round((base64Len * 3) / 4);
          currentW = stepW;
          currentH = stepH;
        }

        const savingsPercentage = originalSizeBytes > 0
          ? Math.max(0, Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100))
          : 0;

        resolve({
          dataUrl: bestDataUrl,
          originalSizeBytes,
          compressedSizeBytes: finalSizeBytes,
          originalSizeFormatted: formatBytes(originalSizeBytes),
          compressedSizeFormatted: formatBytes(finalSizeBytes),
          savingsPercentage,
          width: currentW,
          height: currentH
        });
      };

      img.onerror = (error) => {
        reject(new Error('Failed to load image for compression: ' + error));
      };
    };

    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error));
    };
  });
}
