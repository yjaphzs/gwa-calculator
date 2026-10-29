"use client";

import { useCallback, useMemo, useState } from "react";
import { QrCodeIcon, ScanLineIcon } from "lucide-react";

import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/shared/responsive-dialog";
import { Button } from "@/components/ui/button";
import { QrReceivePanel } from "@/features/transfer/components/qr-transfer/qr-receive-panel";
import { QrSendPanel } from "@/features/transfer/components/qr-transfer/qr-send-panel";
import type { CalculatorState, Semester, Subject } from "@/types";

interface QrTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  semesters: Semester[];
  autosave: boolean;
  onImport: (state: CalculatorState) => void;
}

/** Move calculator data between devices by showing or scanning QR codes. */
export function QrTransferDialog({
  open,
  onOpenChange,
  subjects,
  semesters,
  autosave,
  onImport,
}: QrTransferDialogProps) {
  const [mode, setMode] = useState<"send" | "receive">("send");
  const state = useMemo(() => ({ subjects, semesters, autosave }), [subjects, semesters, autosave]);
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>QR Transfer</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {mode === "send"
              ? "Show this QR code on the sending device. Scan it with the receiving device."
              : "Scan the QR code from the sending device to import data."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="flex flex-col gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-0">
          <div className="flex justify-center gap-2">
            <Button
              variant={mode === "send" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("send")}
            >
              <QrCodeIcon className="size-4" /> Send
            </Button>
            <Button
              variant={mode === "receive" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("receive")}
            >
              <ScanLineIcon className="size-4" /> Receive
            </Button>
          </div>

          {mode === "send" ? (
            <QrSendPanel state={state} />
          ) : (
            <QrReceivePanel onImport={onImport} onClose={close} />
          )}
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
