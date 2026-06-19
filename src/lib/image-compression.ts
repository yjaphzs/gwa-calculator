/**
 * Client-side image optimisation.
 *
 * Encodes to WebP **lossless** so the on-disk size shrinks (often 25–50 %
 * smaller than the source JPEG/PNG) without altering any pixel data. If the
 * browser refuses to encode WebP — or the result somehow grows — we fall
 * back to the original Blob untouched.
 *
 * Resizing is opt-in via `maxEdge` so a default call is genuinely lossless.
 */
export interface CompressOptions {
  /** Optional max longest-edge in pixels. If omitted, no resize is performed. */
  maxEdge?: number;
}

export interface CompressResult {
  blob: Blob;
  /** Suggested filename with new extension applied (.webp on success). */
  filename: string;
  /** Pixel dimensions of the encoded image. */
  width: number;
  height: number;
  /** Encoded MIME type ("image/webp" on success, source type on fallback). */
  type: string;
  /** True when WebP encoding was applied; false on fallback. */
  compressed: boolean;
}

async function loadImageBitmap(file: Blob): Promise<{
  bitmap: ImageBitmap;
  width: number;
  height: number;
}> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { bitmap, width: bitmap.width, height: bitmap.height };
  }
  // Safari < 15 fallback via <img>
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Failed to load image"));
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context unavailable");
    ctx.drawImage(img, 0, 0);
    const bitmap = (await createImageBitmap(canvas)) as ImageBitmap;
    return { bitmap, width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const { maxEdge } = options;

  // Bail on non-images — nothing to do.
  if (!file.type.startsWith("image/")) {
    return {
      blob: file,
      filename: file.name,
      width: 0,
      height: 0,
      type: file.type,
      compressed: false,
    };
  }

  // GIF: animated frames would be lost in canvas. Skip.
  if (file.type === "image/gif") {
    return {
      blob: file,
      filename: file.name,
      width: 0,
      height: 0,
      type: file.type,
      compressed: false,
    };
  }

  let bitmap: ImageBitmap;
  let srcWidth: number;
  let srcHeight: number;
  try {
    const loaded = await loadImageBitmap(file);
    bitmap = loaded.bitmap;
    srcWidth = loaded.width;
    srcHeight = loaded.height;
  } catch {
    return {
      blob: file,
      filename: file.name,
      width: 0,
      height: 0,
      type: file.type,
      compressed: false,
    };
  }

  let outWidth = srcWidth;
  let outHeight = srcHeight;
  if (maxEdge && Math.max(srcWidth, srcHeight) > maxEdge) {
    const ratio = maxEdge / Math.max(srcWidth, srcHeight);
    outWidth = Math.round(srcWidth * ratio);
    outHeight = Math.round(srcHeight * ratio);
  }

  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(outWidth, outHeight)
      : Object.assign(document.createElement("canvas"), {
          width: outWidth,
          height: outHeight,
        });
  const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return {
      blob: file,
      filename: file.name,
      width: srcWidth,
      height: srcHeight,
      type: file.type,
      compressed: false,
    };
  }
  (ctx as CanvasRenderingContext2D).drawImage(bitmap, 0, 0, outWidth, outHeight);
  bitmap.close?.();

  // Encode as WebP lossless (quality=1 with image/webp = lossless in browsers).
  let webp: Blob | null = null;
  try {
    if (canvas instanceof OffscreenCanvas) {
      webp = await canvas.convertToBlob({ type: "image/webp", quality: 1 });
    } else {
      webp = await new Promise<Blob | null>((resolve) =>
        (canvas as HTMLCanvasElement).toBlob((b) => resolve(b), "image/webp", 1),
      );
    }
  } catch {
    webp = null;
  }

  // If WebP failed, or somehow grew the file (and we didn't resize), keep source.
  if (!webp || (!maxEdge && webp.size >= file.size)) {
    return {
      blob: file,
      filename: file.name,
      width: srcWidth,
      height: srcHeight,
      type: file.type,
      compressed: false,
    };
  }

  return {
    blob: webp,
    filename: replaceExtension(file.name, "webp"),
    width: outWidth,
    height: outHeight,
    type: "image/webp",
    compressed: true,
  };
}

/**
 * Convenience wrapper for compressing a raw Blob (e.g. the output of a crop
 * tool) before uploading to Firebase Storage. Internally creates a File so
 * the full compressImage pipeline applies.
 */
export async function compressBlob(
  blob: Blob,
  filename: string,
  options: CompressOptions = {},
): Promise<CompressResult> {
  return compressImage(new File([blob], filename, { type: blob.type }), options);
}
