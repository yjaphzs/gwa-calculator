import { Album, QrCodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface SubjectsEmptyStateProps {
  /** With saved semesters the user only needs "Add"; otherwise offer import too. */
  hasSemesters: boolean;
  onAdd: () => void;
  onImport: () => void;
  onQrTransfer?: () => void;
}

/** Shown in place of the toolbar when there are no working subjects. */
export function SubjectsEmptyState({
  hasSemesters,
  onAdd,
  onImport,
  onQrTransfer,
}: SubjectsEmptyStateProps) {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Album />
        </EmptyMedia>
        <EmptyTitle>No Subjects Found</EmptyTitle>
        <EmptyDescription>
          {hasSemesters
            ? "You have no subjects for this semester. Add subjects to begin tracking your grades. You can view your archived subjects in the semesters tab."
            : "Add subjects to get started and calculate your GWA as you go. You can also import your records if you have existing subject data."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {hasSemesters ? (
          <Button variant="outline" size="sm" onClick={onAdd}>
            Add Subject
          </Button>
        ) : (
          <div className="flex flex-row flex-wrap items-center justify-center gap-2 sm:flex-nowrap">
            <Button variant="outline" size="sm" onClick={onAdd}>
              Add Subject
            </Button>
            <Button variant="outline" size="sm" onClick={onImport}>
              Import Data
            </Button>
            {onQrTransfer && (
              <Button variant="outline" size="sm" onClick={onQrTransfer}>
                <QrCodeIcon className="size-4" />
                QR Transfer
              </Button>
            )}
          </div>
        )}
      </EmptyContent>
    </Empty>
  );
}
