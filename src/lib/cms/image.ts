/** Compress an image File for gallery upload (phone/desktop).
 * Preserves PNG/WebP transparency — never force JPEG on alpha images
 * (JPEG has no alpha channel and fills transparent pixels with black).
 */
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; quality?: number },
): Promise<string> {
  const maxWidth = options?.maxWidth ?? 1000;
  const quality = options?.quality ?? 0.82;

  if (!file.type.startsWith("image/")) {
    throw new Error("Lütfen bir görsel dosyası seçin");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Görsel işlenemedi");

  // Clear to transparent so PNG/WebP keep their alpha
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const keepAlpha =
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "image/gif" ||
    hasTransparentPixels(ctx, width, height);

  if (keepAlpha) {
    // Prefer WebP when supported (smaller); fall back to PNG for transparency.
    try {
      const webp = canvas.toDataURL("image/webp", quality);
      if (webp.startsWith("data:image/webp")) return webp;
    } catch {
      /* browser may not support webp encode */
    }
    return canvas.toDataURL("image/png");
  }

  // Opaque photos → JPEG
  return canvas.toDataURL("image/jpeg", quality);
}

function hasTransparentPixels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): boolean {
  try {
    // Sample a grid — full scan is expensive for large images
    const stepX = Math.max(1, Math.floor(width / 48));
    const stepY = Math.max(1, Math.floor(height / 48));
    const data = ctx.getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y += stepY) {
      for (let x = 0; x < width; x += stepX) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha < 250) return true;
      }
    }
  } catch {
    /* tainted canvas / security — assume no alpha */
  }
  return false;
}
