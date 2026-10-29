import {
  ArchiveIcon,
  DownloadIcon,
  FilesIcon,
  FileTextIcon,
  ImportIcon,
  QrCodeIcon,
  RotateCcw,
  SaveAllIcon,
  SaveIcon,
} from "lucide-react";

import type { MenuGroup, MenuItem } from "@/components/shared/menu-types";
import type { SubjectsToolbarActions } from "@/features/calculator/components/toolbar/subjects-toolbar";

export interface SubjectMenuOptions {
  actions: SubjectsToolbarActions;
  hasSemesters: boolean;
  autosave: boolean;
  onAutosaveChange: (enabled: boolean) => void;
  /**
   * Set for the phone sheet, which has no toolbar beside it: groups get
   * headings and the sheet also offers Reset (this opens its confirmation).
   */
  onRequestReset?: () => void;
}

/** The subjects "⋯" menu as data, so the dropdown and the sheet list the same actions. */
export function buildSubjectMenuGroups({
  actions,
  hasSemesters,
  autosave,
  onAutosaveChange,
  onRequestReset,
}: SubjectMenuOptions): MenuGroup[] {
  const sheet = onRequestReset !== undefined;
  const heading = (text: string) => (sheet ? text : undefined);

  const transfer: MenuItem[] = [
    { kind: "action", id: "import", label: "Import", icon: ImportIcon, onSelect: actions.onImport },
    { kind: "action", id: "export", label: "Export", icon: DownloadIcon, onSelect: actions.onExport },
  ];
  if (actions.onQrTransfer) {
    transfer.push({ kind: "action", id: "qr", label: "QR Transfer", icon: QrCodeIcon, onSelect: actions.onQrTransfer });
  }

  const reports: MenuItem[] = [
    { kind: "action", id: "semester-report", label: "Semester Report", icon: FileTextIcon, onSelect: actions.onSemesterReport },
  ];
  if (hasSemesters) {
    reports.push({ kind: "action", id: "summary", label: "Academic Summary", icon: FilesIcon, onSelect: actions.onAcademicSummary });
  }

  const groups: MenuGroup[] = [
    {
      id: "semester",
      label: heading("Semester"),
      items: [
        { kind: "action", id: "save-semester", label: "Save as semester", icon: ArchiveIcon, onSelect: actions.onSaveSemester },
      ],
    },
    { id: "transfer", label: heading("Move your data"), items: transfer },
    { id: "reports", label: heading("Print or save as PDF"), items: reports },
    {
      id: "saving",
      label: heading("Saving"),
      items: [
        { kind: "action", id: "save", label: "Save", icon: SaveIcon, onSelect: actions.onSave },
        {
          kind: "toggle",
          id: "autosave",
          label: "Autosave",
          icon: SaveAllIcon,
          checked: autosave,
          onCheckedChange: onAutosaveChange,
          hint: autosave ? "Every change is saved right away" : "Changes wait until you tap Save",
        },
      ],
    },
  ];

  if (onRequestReset) {
    groups.push({
      id: "reset",
      items: [
        { kind: "action", id: "reset", label: "Reset subjects", icon: RotateCcw, onSelect: onRequestReset, destructive: true },
      ],
    });
  }

  return groups;
}
