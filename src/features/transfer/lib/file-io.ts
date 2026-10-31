/** Trigger a browser download of `data` as pretty-printed JSON. */
export function downloadJson(data: unknown, filename: string): void {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

/** Trigger a browser download of any file (JSON backups, share images). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Open the file picker for a JSON file and hand the chosen file to `onFile`. */
export function pickJsonFile(onFile: (file: File) => void): void {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.style.display = "none";

  input.onchange = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    // Safely remove — may already be gone in edge cases
    if (document.body.contains(input)) document.body.removeChild(input);
    if (file) onFile(file);
  };

  // Keep element in DOM until after onchange fires
  document.body.appendChild(input);
  input.click();
}
