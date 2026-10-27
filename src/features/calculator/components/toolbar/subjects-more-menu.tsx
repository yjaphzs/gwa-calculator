"use client";

import {
  ArchiveIcon,
  DownloadIcon,
  FilesIcon,
  FileTextIcon,
  ImportIcon,
  MoreHorizontalIcon,
  QrCodeIcon,
  SaveAllIcon,
  SaveIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubjectsToolbarActions } from "@/features/calculator/components/toolbar/subjects-toolbar";

interface SubjectsMoreMenuProps {
  actions: SubjectsToolbarActions;
  hasSemesters: boolean;
  autosave: boolean;
  onAutosaveChange: (enabled: boolean) => void;
}

/** The "⋯" menu: save semester, import/export, reports, save + autosave. */
export function SubjectsMoreMenu({
  actions,
  hasSemesters,
  autosave,
  onAutosaveChange,
}: SubjectsMoreMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="More Options">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={actions.onSaveSemester}>
            <ArchiveIcon />
            Save as semester
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={actions.onImport}>
            <ImportIcon />
            Import
          </DropdownMenuItem>
          <DropdownMenuItem onClick={actions.onExport}>
            <DownloadIcon />
            Export
          </DropdownMenuItem>
          {actions.onQrTransfer && (
            <DropdownMenuItem onClick={actions.onQrTransfer}>
              <QrCodeIcon />
              QR Transfer
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={actions.onSemesterReport}>
            <FileTextIcon />
            Semester Report
          </DropdownMenuItem>
          {hasSemesters && (
            <DropdownMenuItem onClick={actions.onAcademicSummary}>
              <FilesIcon />
              Academic Summary
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={actions.onSave}>
            <SaveIcon />
            Save
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SaveAllIcon />
              Autosave
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={autosave ? "enable" : "disabled"}
                onValueChange={(value) => onAutosaveChange(value === "enable")}
              >
                <DropdownMenuRadioItem value="enable">Enable</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="disabled">Disable</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
