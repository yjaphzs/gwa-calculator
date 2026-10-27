import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

import { parseCalculatorImport } from "@/features/transfer/lib/calculator-io";
import type { CalculatorState } from "@/types";

// QR code max safe payload (~2900 bytes binary). We use a conservative limit.
export const QR_CHUNK_SIZE = 1800;

// Frame formats: a single code is `GC1:<data>`; a multi-code transfer is
// `GC:<index>/<total>:<data>` with a 1-based index.
const SINGLE_PREFIX = "GC1:";
const CHUNK_PATTERN = /^GC:(\d+)\/(\d+):(.+)$/;

export type TransferFrame =
  | { kind: "single"; data: string }
  | { kind: "chunk"; index: number; total: number; data: string };

function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
  return chunks;
}

/** Compress the state and split it into the QR payloads to show, in order. */
export function encodeTransferFrames(state: CalculatorState, chunkSize = QR_CHUNK_SIZE) {
  const compressed = compressToEncodedURIComponent(
    JSON.stringify({ subjects: state.subjects, semesters: state.semesters, autosave: state.autosave }),
  );
  const chunks = chunkString(compressed, chunkSize);
  const frames =
    chunks.length === 1
      ? [`${SINGLE_PREFIX}${chunks[0]}`]
      : chunks.map((chunk, i) => `GC:${i + 1}/${chunks.length}:${chunk}`);
  return { frames, compressedLength: compressed.length };
}

/** Parse one scanned QR payload, or null when it isn't one of ours. */
export function parseTransferFrame(text: string): TransferFrame | null {
  if (text.startsWith(SINGLE_PREFIX)) {
    return { kind: "single", data: text.slice(SINGLE_PREFIX.length) };
  }
  const match = text.match(CHUNK_PATTERN);
  if (!match) return null;
  return {
    kind: "chunk",
    index: parseInt(match[1], 10),
    total: parseInt(match[2], 10),
    data: match[3],
  };
}

/** Join received chunks (keyed by 1-based index) back into the compressed payload. */
export function assembleChunks(chunks: Map<number, string>, total: number): string {
  let compressed = "";
  for (let i = 1; i <= total; i++) compressed += chunks.get(i) ?? "";
  return compressed;
}

/** Decompress and validate a complete payload. Throws when it's corrupt or invalid. */
export function decodeTransferPayload(compressed: string): CalculatorState {
  const json = decompressFromEncodedURIComponent(compressed);
  if (!json) throw new Error("Decompression failed");
  return parseCalculatorImport(JSON.parse(json));
}
