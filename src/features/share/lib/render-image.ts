import { FORMAT_SIZE, type ShareFormat } from "@/features/share/lib/share-options";

/**
 * Turns the template element into a PNG at its true size (the preview only
 * scales it with CSS). The renderer is loaded on first use; fonts must be ready
 * or the image falls back to system fonts.
 */
export async function renderShareImage(node: HTMLElement, format: ShareFormat): Promise<Blob> {
  const { width, height } = FORMAT_SIZE[format];
  await document.fonts?.ready;
  const { domToBlob } = await import("modern-screenshot");
  const blob = await domToBlob(node, { width, height, scale: 1, type: "image/png" });
  if (!blob) throw new Error("The image couldn't be created.");
  return blob;
}
