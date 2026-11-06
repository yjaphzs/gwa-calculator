"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";

import { SiteFooter } from "@/components/layout/site-footer";
import { AppShell } from "@/components/layout/app-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculatorSkeleton } from "@/features/calculator/components/calculator-skeleton";
import { CelebrationFireworks } from "@/features/calculator/components/celebration-fireworks";
import { CurrentPanel } from "@/features/calculator/components/current-panel";
import { SubjectEditorDialog } from "@/features/calculator/components/subject-editor-dialog";
import { WhatIfDialog } from "@/features/calculator/components/what-if/what-if-dialog";
import { useBadges } from "@/features/achievements/hooks/use-badges";
import { useCelebrations } from "@/features/calculator/hooks/use-celebrations";
import { useSubjectActions } from "@/features/calculator/hooks/use-subject-actions";
import { useSubjectFilter } from "@/features/calculator/hooks/use-subject-filter";
import { MergeDialog } from "@/features/persistence/components/merge-dialog";
import { useCalculatorData } from "@/features/persistence/hooks/use-calculator-data";
import { useReportActions } from "@/features/reports/hooks/use-report-actions";
import { ImprovementDialog } from "@/features/semesters/components/improvement-dialog";
import { SemesterEditorDialog } from "@/features/semesters/components/semester-editor-dialog";
import { SemestersPanel } from "@/features/semesters/components/semesters-panel";
import { useShareDialog } from "@/features/share/hooks/use-share-dialog";
import { SavedSubjectDialog } from "@/features/semesters/components/saved-subject-dialog";
import { useSavedSubjectEditor } from "@/features/semesters/hooks/use-saved-subject-editor";
import { useSemesterActions } from "@/features/semesters/hooks/use-semester-actions";
import { QrTransferDialog } from "@/features/transfer/components/qr-transfer/qr-transfer-dialog";
import { useFileTransfer } from "@/features/transfer/hooks/use-file-transfer";
import { WrappedBanner } from "@/features/wrapped/components/wrapped-banner";
import { useWrappedDialog } from "@/features/wrapped/hooks/use-wrapped-dialog";
import { useEditorDialog } from "@/hooks/use-editor-dialog";
import { useFocusShortcut } from "@/hooks/use-focus-shortcut";
import { computeGwa, getHonorFor } from "@/lib/academic";
import type { Semester, Subject } from "@/types";

// The share studio (templates, image rendering) loads the first time Share is used.
const ShareStudio = dynamic(() => import("@/features/share/components/share-studio"), { ssr: false });
const WrappedViewer = dynamic(() => import("@/features/wrapped/components/wrapped-viewer"), { ssr: false });

/** The calculator page: Current and Semesters tabs, plus the dialogs they open. */
export function CalculatorView() {
  // Unified persistence: localStorage when signed out, Firestore (live sync)
  // when signed in, with the same dispatcher API as useState.
  const data = useCalculatorData();
  const { subjects, semesters, autosave } = data;

  const [tab, setTab] = useState("current");
  const [qrOpen, setQrOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { gwa, totalUnits } = useMemo(() => computeGwa(subjects), [subjects]);
  const honor = useMemo(() => getHonorFor(subjects), [subjects]);

  const filter = useSubjectFilter(subjects);
  const searchInputRef = useFocusShortcut("k");
  const subjectEditor = useEditorDialog<Subject>();
  const semesterEditor = useEditorDialog<Semester>();
  const savedSubject = useSavedSubjectEditor();
  const subjectActions = useSubjectActions(data);
  const semesterActions = useSemesterActions(data);
  const transfer = useFileTransfer({ state: { subjects, semesters, autosave }, replaceAll: data.replaceAll });
  const reports = useReportActions(subjects, semesters);
  const share = useShareDialog();
  const wrapped = useWrappedDialog();
  const celebrations = useCelebrations({ subjects, semesters, honor, loading: data.loading });
  // Toasts for badges earned while using the calculator, and the nav's new-badge dot.
  useBadges({ subjects, semesters, ready: !data.loading });

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
                <WrappedBanner semesters={semesters} onOpen={wrapped.openWrapped} />
                <CurrentPanel
                  subjects={subjects}
                  hasSemesters={semesters.length > 0}
                  gwa={gwa}
                  honor={honor}
                  totalUnits={totalUnits}
                  celebration={celebrations.celebration}
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
                    onShare: (preset) => share.openShare({ ...preset, scope: { kind: "current" } }),
                    onWhatIf: () => setWhatIfOpen(true),
                  }}
                />
              </TabsContent>
              <TabsContent value="semesters" className="pt-4">
                <SemestersPanel
                  semesters={semesters}
                  expanded={expanded}
                  onToggle={toggleSemester}
                  onAcademicSummary={reports.printSummary}
                  onShareOverall={() => share.openShare({ scope: { kind: "overall" } })}
                  onWrapped={wrapped.openWrapped}
                  onSaveCurrent={semesterEditor.openCreate}
                  hasCurrentSubjects={subjects.length > 0}
                  actions={{
                    onReport: reports.printSemester,
                    onShare: (semester) => share.openShare({ scope: { kind: "semester", id: semester.id } }),
                    onEdit: semesterEditor.openEdit,
                    onDelete: semesterActions.deleteSemester,
                    onEditSubject: savedSubject.openEdit,
                    onAddSubject: savedSubject.openCreate,
                  }}
                />
              </TabsContent>
            </Tabs>
          )}

      <CelebrationFireworks active={celebrations.celebration.open} />

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
        onCreate={(values) => {
          const saved = semesterActions.createSemester(values);
          celebrations.onSemesterSaved([...semesters, saved], saved);
        }}
        onUpdate={semesterActions.updateSemester}
      />
      <SavedSubjectDialog saved={savedSubject} actions={semesterActions} />
      <WhatIfDialog open={whatIfOpen} onOpenChange={setWhatIfOpen} subjects={subjects} />
      <QrTransferDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        subjects={subjects}
        semesters={semesters}
        autosave={autosave}
        onImport={transfer.handleQrImport}
      />
      {share.used && (
        <ShareStudio
          open={share.open}
          onOpenChange={share.setOpen}
          preset={share.preset}
          subjects={subjects}
          semesters={semesters}
        />
      )}
      {wrapped.used && <WrappedViewer open={wrapped.open} onOpenChange={wrapped.setOpen} semesters={semesters} />}
      <ImprovementDialog
        saved={celebrations.saved}
        onClose={celebrations.closeSaved}
        onShare={(semester) => share.openShare({ scope: { kind: "semester", id: semester.id }, mood: "fun" })}
      />
      <MergeDialog conflict={data.pendingMerge} onResolve={data.resolveMerge} />
    </AppShell>
  );
}
