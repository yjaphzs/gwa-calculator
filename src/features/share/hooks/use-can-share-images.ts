"use client";

import { useSyncExternalStore } from "react";

import { canShareImages } from "@/features/share/lib/share-targets";

const subscribe = () => () => {};

/** Whether this browser can hand an image to other apps (false until hydrated). */
export function useCanShareImages(): boolean {
  return useSyncExternalStore(subscribe, canShareImages, () => false);
}
