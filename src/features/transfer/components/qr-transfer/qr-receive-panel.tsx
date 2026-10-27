"use client";

import { useCallback } from "react";
import { CameraIcon, CameraOffIcon, ScanLineIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQrReceiver } from "@/features/transfer/hooks/use-qr-receiver";
import { useQrScanner } from "@/features/transfer/hooks/use-qr-scanner";
import type { CalculatorState } from "@/types";

const READER_ID = "qr-reader";

interface QrReceivePanelProps {
  onImport: (state: CalculatorState) => void;
  onClose: () => void;
}

/** Scans QR codes from the sending device with the camera and imports them. */
export function QrReceivePanel({ onImport, onClose }: QrReceivePanelProps) {
  const handleComplete = useCallback(
    (state: CalculatorState) => {
      onImport(state);
      onClose();
    },
    [onImport, onClose],
  );
  const receiver = useQrReceiver(handleComplete);
  const scanner = useQrScanner(READER_ID, receiver.handleScan);

  const cameraOn = scanner.starting || scanner.scanning;
  const error = scanner.error ?? receiver.error;

  const start = () => {
    receiver.reset();
    scanner.start();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id={READER_ID}
        className="aspect-square w-full overflow-hidden rounded-lg bg-muted [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover!"
        style={{ display: cameraOn ? "block" : "none" }}
      />

      {!cameraOn && (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-muted">
          <div className="text-center text-muted-foreground">
            <ScanLineIcon className="mx-auto mb-2 size-12" />
            <p className="text-sm">Press Start to open camera</p>
          </div>
        </div>
      )}

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {receiver.progress && receiver.progress.total > 1 && (
        <div className="text-center text-sm text-muted-foreground">
          Scanned {receiver.progress.received} / {receiver.progress.total} QR codes
        </div>
      )}

      <Button
        variant={scanner.scanning ? "destructive" : "default"}
        size="sm"
        disabled={scanner.starting && !scanner.scanning}
        onClick={scanner.scanning ? scanner.stop : start}
      >
        {scanner.scanning ? (
          <>
            <CameraOffIcon className="size-4" /> Stop Camera
          </>
        ) : (
          <>
            <CameraIcon className="size-4" /> Start Camera
          </>
        )}
      </Button>
    </div>
  );
}
