/** Compress an image File for gallery upload (phone/desktop). Returns JPEG data URL. */
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
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
