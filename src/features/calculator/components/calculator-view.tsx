"use client";

import { useCallback, useMemo, useState } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorSkeleton } from "@/features/calculator/components/calculator-skeleton";
import { CelebrationFireworks } from "@/features/calculator/components/celebration-fireworks";
import { CurrentPanel } from "@/features/calculator/components/current-panel";
import { SubjectEditorDialog } from "@/features/calculator/components/subject-editor-dialog";
import { useSubjectActions } from "@/features/calculator/hooks/use-subject-actions";
import { useSubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import { MergeDialog } from "@/features/persistence/components/merge-dialog";
import { useCalculatorData } from "@/features/persistence/hooks/use-calculator-data";
import { useReportActions } from "@/features/reports/hooks/use-report-actions";
import { SemesterEditorDialog } from "@/features/semesters/components/semester-editor-dialog";
import { SemestersPanel } from "@/features/semesters/components/semesters-panel";
import { useSemesterActions } from "@/features/semesters/hooks/use-semester-actions";
import { QrTransferDialog } from "@/features/transfer/components/qr-transfer/qr-transfer-dialog";
import { useFileTransfer } from "@/features/transfer/hooks/use-file-transfer";
import { useEditorDialog } from "@/hooks/use-editor-dialog";
import { useFocusShortcut } from "@/hooks/use-focus-shortcut";
import { computeGwa, getHonorFor } from "@/lib/academic";
import type { Semester, Subject } from "@/types";

/** The calculator page: Current and Semesters tabs, plus the dialogs they open. */
export function CalculatorView() {
  // Unified persistence: localStorage when signed out, Firestore (live sync)
  // when signed in, with the same dispatcher API as useState.
  const data = useCalculatorData();
  const { subjects, semesters, autosave } = data;

  const [tab, setTab] = useState("current");
  const [celebrating, setCelebrating] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { gwa, totalUnits } = useMemo(() => computeGwa(subjects), [subjects]);
  const honor = useMemo(() => getHonorFor(subjects), [subjects]);

  const filter = useSubjectFilter(subjects);
  const searchInputRef = useFocusShortcut("k");
  const subjectEditor = useEditorDialog<Subject>();
  const semesterEditor = useEditorDialog<Semester>();
  const subjectActions = useSubjectActions(data);
  const semesterActions = useSemesterActions(data);
  const transfer = useFileTransfer({ state: { subjects, semesters, autosave }, replaceAll: data.replaceAll });
  const reports = useReportActions(subjects, semesters);

  const toggleSemester = useCallback(
    (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] })),
    [],
  );

  return (
    <AppShell footer={<SiteFooter />}>
          {data.loading ? (
            <CalculatorSkeleton />
          ) : (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger value="semesters">
                  Semesters{semesters.length > 0 && ` (${semesters.length})`}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="current">
                <CurrentPanel
                  subjects={subjects}
                  hasSemesters={semesters.length > 0}
                  gwa={gwa}
                  honor={honor}
                  totalUnits={totalUnits}
                  celebration={{ open: celebrating, onOpenChange: setCelebrating }}
                  autosave={autosave}
                  onAutosaveChange={data.setAutosave}
                  filter={filter}
                  searchInputRef={searchInputRef}
                  onEdit={subjectEditor.openEdit}
                  onDelete={subjectActions.deleteSubject}
                  actions={{
                    onAdd: subjectEditor.openCreate,
                    onReset: subjectActions.resetSubjects,
                    onSaveSemester: semesterEditor.openCreate,
                    onImport: transfer.handleImport,
                    onExport: transfer.handleExport,
                    onQrTransfer: () => setQrOpen(true),
                    onSemesterReport: reports.printWorkingSet,
                    onAcademicSummary: reports.printSummary,
                    onSave: subjectActions.saveNow,
                  }}
                />
              </TabsContent>
              <TabsContent value="semesters" className="pt-4">
                <SemestersPanel
                  semesters={semesters}
                  expanded={expanded}
                  onToggle={toggleSemester}
                  onAcademicSummary={reports.printSummary}
                  onSaveCurrent={semesterEditor.openCreate}
                  hasCurrentSubjects={subjects.length > 0}
                  actions={{
                    onReport: reports.printSemester,
                    onEdit: semesterEditor.openEdit,
                    onDelete: semesterActions.deleteSemester,
                  }}
                />
              </TabsContent>
            </Tabs>
          )}

      <CelebrationFireworks active={celebrating} />

      <SubjectEditorDialog
        editor={subjectEditor}
        subjects={subjects}
        onCreate={subjectActions.createSubject}
        onUpdate={subjectActions.updateSubject}
      />
      <SemesterEditorDialog
        editor={semesterEditor}
        semesters={semesters}
        subjects={subjects}
        onCreate={semesterActions.createSemester}
        onUpdate={semesterActions.updateSemester}
      />
      <QrTransferDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        subjects={subjects}
        semesters={semesters}
        autosave={autosave}
        onImport={transfer.handleQrImport}
      />
      <MergeDialog conflict={data.pendingMerge} onResolve={data.resolveMerge} />
    </AppShell>
  );
}
