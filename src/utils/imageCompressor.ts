/**
 * Image Compression Utility for Teachers' Media Covers & Profile Avatars
 * 
 * Compresses images client-side via HTML5 Canvas before saving or uploading:
 * - Downscales large photos (e.g. 5-12 MB phone camera photos) to max 320x320 px (profile) or 800x600 px (cover)
 * - Converts to optimized WebP / JPEG
 * - Reduces file size by 95% - 99% (typically from 5 MB to ~15-30 KB)
 * - Drastically saves database storage and delivers blazing-fast load speeds!
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
  targetMaxBytes?: number;
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
 * Loads an image from a File or Blob using multiple fallback strategies:
 * 1. createImageBitmap (fastest, background thread)
 * 2. URL.createObjectURL + HTMLImageElement
 * 3. FileReader.readAsDataURL + HTMLImageElement
 */
async function loadImageElement(file: File | Blob): Promise<{
  width: number;
  height: number;
  drawToCanvas: (ctx: CanvasRenderingContext2D, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) => void;
}> {
  // Strategy 1: createImageBitmap
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        drawToCanvas: (ctx, sx, sy, sw, sh, dx, dy, dw, dh) => {
          ctx.drawImage(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);
        }
      };
    } catch {
      // Fall through to Strategy 2
    }
  }

  // Strategy 2: URL.createObjectURL
  if (typeof window !== 'undefined' && 'URL' in window && typeof URL.createObjectURL === 'function') {
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = (e) => reject(e);
        image.src = objectUrl;
      });
      URL.revokeObjectURL(objectUrl);

      return {
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        drawToCanvas: (ctx, sx, sy, sw, sh, dx, dy, dw, dh) => {
          ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
      };
    } catch {
      // Fall through to Strategy 3
    }
  }

  // Strategy 3: FileReader DataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          drawToCanvas: (ctx, sx, sy, sw, sh, dx, dy, dw, dh) => {
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
          }
        });
      };
      img.onerror = (err) => reject(new Error('Failed to decode image data: ' + err));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err));
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses a File or Blob client-side using Adaptive Multi-Pass Ultra Compression:
 * - Profile targets: max 320x320 px square 1:1, ≤ 35 KB (WebP)
 * - Media Thumbnail targets: max 800x800 px, ≤ 200 KB
 * - Exam Cover targets: max 800x600 px, ≤ 100 KB
 * - Strips all EXIF / GPS / camera metadata
 * - Converts to optimized WebP (with automatic JPEG fallback)
 */
export async function compressImageFile(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const mode = options.mode || 'thumbnail';
  const isProfile = mode === 'profile';
  const defaultMaxDim = isProfile ? 320 : 800;
  const defaultTargetBytes = isProfile 
    ? 35 * 1024 
    : mode === 'exam_cover' 
      ? 100 * 1024 
      : 200 * 1024;

  const maxW = options.maxWidth || defaultMaxDim;
  const maxH = options.maxHeight || (mode === 'exam_cover' ? 600 : (isProfile ? 320 : defaultMaxDim));
  const targetBytes = options.targetMaxBytes || defaultTargetBytes;
  const originalSizeBytes = file.size;

  const loadedImg = await loadImageElement(file);
  const srcW = loadedImg.width;
  const srcH = loadedImg.height;

  if (srcW <= 0 || srcH <= 0) {
    throw new Error('Invalid image dimensions');
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: false });
  if (!ctx) {
    throw new Error('Could not initialize HTML5 Canvas 2D context');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  let finalW = srcW;
  let finalH = srcH;

  if (isProfile) {
    // Center-crop 1:1 square for distortion-free avatars
    const minSide = Math.min(srcW, srcH);
    const startX = Math.round((srcW - minSide) / 2);
    const startY = Math.round((srcH - minSide) / 2);
    finalW = Math.min(maxW, 320, minSide);
    finalH = finalW;

    canvas.width = finalW;
    canvas.height = finalH;

    // Fill white background for safety
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, finalW, finalH);

    loadedImg.drawToCanvas(ctx, startX, startY, minSide, minSide, 0, 0, finalW, finalH);
  } else {
    // Proportional downscale to fit max bounding box
    if (srcW > srcH) {
      if (srcW > maxW) {
        finalH = Math.max(1, Math.round((srcH * maxW) / srcW));
        finalW = maxW;
      }
    } else {
      if (srcH > maxH) {
        finalW = Math.max(1, Math.round((srcW * maxH) / srcH));
        finalH = maxH;
      }
    }

    canvas.width = finalW;
    canvas.height = finalH;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, finalW, finalH);

    loadedImg.drawToCanvas(ctx, 0, 0, srcW, srcH, 0, 0, finalW, finalH);
  }

  // Multi-pass compression to find optimal quality
  const preferredMime = options.mimeType || 'image/webp';
  const qualities = isProfile 
    ? [options.quality || 0.75, 0.65, 0.55, 0.45] 
    : [options.quality || 0.80, 0.70, 0.60, 0.50];

  let bestDataUrl = '';
  let finalSizeBytes = 0;

  for (const q of qualities) {
    let testUrl = canvas.toDataURL(preferredMime, q);
    
    // Fallback to JPEG if WebP is unsupported or empty
    if (!testUrl || testUrl === 'data:,' || (preferredMime === 'image/webp' && !testUrl.startsWith('data:image/webp'))) {
      testUrl = canvas.toDataURL('image/jpeg', q);
    }

    const base64Content = testUrl.substring(testUrl.indexOf(',') + 1);
    const approxSize = Math.round((base64Content.length * 3) / 4);

    bestDataUrl = testUrl;
    finalSizeBytes = approxSize;

    if (approxSize <= targetBytes) {
      break;
    }
  }

  // If still above target size and dimension > 240, do one downsampling pass
  if (finalSizeBytes > targetBytes && (finalW > 240 || finalH > 240)) {
    const downW = Math.round(finalW * 0.8);
    const downH = Math.round(finalH * 0.8);
    const downCanvas = document.createElement('canvas');
    downCanvas.width = downW;
    downCanvas.height = downH;
    const downCtx = downCanvas.getContext('2d');
    if (downCtx) {
      downCtx.imageSmoothingEnabled = true;
      downCtx.imageSmoothingQuality = 'high';
      downCtx.drawImage(canvas, 0, 0, downW, downH);

      let stepUrl = downCanvas.toDataURL(preferredMime, 0.60);
      if (!stepUrl || stepUrl === 'data:,' || (preferredMime === 'image/webp' && !stepUrl.startsWith('data:image/webp'))) {
        stepUrl = downCanvas.toDataURL('image/jpeg', 0.60);
      }
      const base64Content = stepUrl.substring(stepUrl.indexOf(',') + 1);
      bestDataUrl = stepUrl;
      finalSizeBytes = Math.round((base64Content.length * 3) / 4);
      finalW = downW;
      finalH = downH;
    }
  }

  const savingsPercentage = originalSizeBytes > 0
    ? Math.max(0, Math.round(((originalSizeBytes - finalSizeBytes) / originalSizeBytes) * 100))
    : 0;

  return {
    dataUrl: bestDataUrl,
    originalSizeBytes,
    compressedSizeBytes: finalSizeBytes,
    originalSizeFormatted: formatBytes(originalSizeBytes),
    compressedSizeFormatted: formatBytes(finalSizeBytes),
    savingsPercentage,
    width: finalW,
    height: finalH
  };
}
