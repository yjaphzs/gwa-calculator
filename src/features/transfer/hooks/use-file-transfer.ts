"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { parseCalculatorImport } from "@/features/transfer/lib/calculator-io";
import { downloadJson, pickJsonFile } from "@/features/transfer/lib/file-io";
import type { CalculatorState } from "@/types";

const EXPORT_FILENAME = "gwa-calculator-export.json";

interface Options {
  /** Current in-memory state — includes unsaved subjects when autosave is off. */
  state: CalculatorState;
  replaceAll: (state: CalculatorState) => void;
}

/** JSON file export/import and the QR-transfer import, with user feedback. */
export function useFileTransfer({ state, replaceAll }: Options) {
  const handleExport = useCallback(() => {
    try {
      downloadJson(
        { subjects: state.subjects, semesters: state.semesters, autosave: state.autosave },
        EXPORT_FILENAME,
      );
      toast.success(`Exported data as ${EXPORT_FILENAME}!`);
    } catch {
      toast.error("Failed to export data.");
    }
  }, [state]);

  const handleImport = useCallback(() => {
    pickJsonFile(async (file) => {
      try {
        replaceAll(parseCalculatorImport(JSON.parse(await file.text())));
        toast.success("Imported data successfully!");
      } catch (error: any) {
        toast.error(`Failed to import data: ${error?.message ?? "Unknown error"}`);
      }
    });
  }, [replaceAll]);

  const handleQrImport = useCallback(
    (data: CalculatorState) => {
      replaceAll({ subjects: data.subjects, semesters: data.semesters, autosave: data.autosave });
      toast.success("Data imported via QR transfer!");
    },
    [replaceAll],
  );

  return { handleExport, handleImport, handleQrImport };
}
