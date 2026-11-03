export type ShareOutcome = "shared" | "cancelled" | "unsupported";

/** Whether this browser can hand an image to other apps (phones, mostly). */
export function canShareImages(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  const probe = new File([new Uint8Array(1)], "probe.png", { type: "image/png" });
  return navigator.canShare({ files: [probe] });
}

/**
 * Opens the system share sheet with the image and text, which is how an image
 * reaches Instagram, Facebook, Messenger, X or TikTok from a web app.
 */
export async function shareImage(blob: Blob, fileName: string, text: string): Promise<ShareOutcome> {
  const file = new File([blob], fileName, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) return "unsupported";
  try {
    await navigator.share({ files: [file], text });
    return "shared";
  } catch (err) {
    // The user closing the sheet isn't an error.
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    throw err;
  }
}

/** Opens the share sheet with a link (an invite, say), or returns "unsupported" so the caller can copy it. */
export async function shareUrl(url: string, text: string): Promise<ShareOutcome> {
  if (typeof navigator === "undefined" || !navigator.share) return "unsupported";
  try {
    await navigator.share({ url, text });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    return "unsupported";
  }
}
