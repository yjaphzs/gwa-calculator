"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useLatest } from "@/hooks/use-latest";

type Html5QrcodeInstance = InstanceType<(typeof import("html5-qrcode"))["Html5Qrcode"]>;

const CAMERA_ERROR = "Could not access camera. Please grant camera permission and try again.";

/**
 * Camera QR scanner (html5-qrcode, loaded on demand) rendered into the element
 * with `elementId`. `start` mounts the camera once that element is visible;
 * every decoded payload goes to `onResult`.
 */
export function useQrScanner(elementId: string, onResult: (text: string) => void) {
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeInstance | null>(null);
  const onResultRef = useLatest(onResult);

  const start = useCallback(() => {
    setError(null);
    setStarting(true);
  }, []);

  // Actually start the scanner after the container is visible
  useEffect(() => {
    if (!starting || scanning) return;
    let cancelled = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => onResultRef.current(decodedText),
          () => {},
        );
        if (cancelled) {
          await scanner.stop().catch(() => {});
          return;
        }
        setScanning(true);
      } catch {
        if (!cancelled) {
          setError(CAMERA_ERROR);
          setStarting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [starting, scanning, elementId, onResultRef]);

  const stop = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        /* ignore */
      }
      scannerRef.current = null;
    }
    setScanning(false);
    setStarting(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return { scanning, starting, error, start, stop };
}
