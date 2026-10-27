import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";

import {
  assembleChunks,
  decodeTransferPayload,
  encodeTransferFrames,
  parseTransferFrame,
} from "@/features/transfer/lib/qr-frames";
import type { CalculatorState } from "@/types";

const state: CalculatorState = {
  subjects: [{ id: "1", code: "MATH101", title: "Calculus I", grade: 1.25, units: 3 }],
  semesters: [
    {
      id: "s1",
      semester: "First",
      schoolYear: "2025-2026",
      subjects: [{ id: "2", code: "ENG102", title: "Purposive Comm", grade: 1.5, units: 3 }],
    },
  ],
  autosave: false,
};

/** Simulate a receiving device: parse each frame and reassemble. */
function receive(frames: string[]): CalculatorState {
  const chunks = new Map<number, string>();
  let total = 0;
  for (const text of frames) {
    const frame = parseTransferFrame(text);
    if (!frame) throw new Error("bad frame");
    if (frame.kind === "single") return decodeTransferPayload(frame.data);
    chunks.set(frame.index, frame.data);
    total = frame.total;
  }
  return decodeTransferPayload(assembleChunks(chunks, total));
}

describe("QR transfer frames", () => {
  it("round-trips a small state in a single GC1 frame", () => {
    const { frames } = encodeTransferFrames(state);
    expect(frames).toHaveLength(1);
    expect(frames[0].startsWith("GC1:")).toBe(true);
    expect(receive(frames)).toEqual(state);
  });

  it("round-trips across multiple GC frames, in any scan order", () => {
    const { frames } = encodeTransferFrames(state, 20);
    expect(frames.length).toBeGreaterThan(1);
    expect(frames[0]).toMatch(/^GC:1\/\d+:/);
    expect(receive([...frames].reverse())).toEqual(state);
  });

  it("rejects foreign QR codes", () => {
    expect(parseTransferFrame("https://example.com")).toBeNull();
  });

  it("throws on corrupt payloads", () => {
    expect(() => decodeTransferPayload("not-lz-data")).toThrow();
  });

  it("validates decoded data like a file import", () => {
    const invalid = compressToEncodedURIComponent(JSON.stringify({ subjects: "x", semesters: [] }));
    expect(() => decodeTransferPayload(invalid)).toThrow("'subjects'");
  });

  it("defaults autosave for payloads that omit it", () => {
    const legacy = compressToEncodedURIComponent(JSON.stringify({ subjects: [], semesters: [] }));
    expect(decodeTransferPayload(legacy).autosave).toBe(true);
  });
});
