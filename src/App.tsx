import React, { useState, useRef, useEffect } from "react";
import AppHeader from "@/components/dom/app-header";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import KofiButton from "@/components/dom/KofiButton";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { FireworksBackground } from "@/components/ui/shadcn-io/fireworks-background";
import { getAcademicHonor } from "@/lib/academic";
import { useEventListener } from "@/hooks/use-event-listener";
import { useLocalStorage } from "@/hooks/use-local-storage";

import GWASummary from "@/components/smart/gwa-summary";
import SubjectsToolbar from "@/components/smart/subjects-toolbar";
import SubjectList from "@/components/smart/subjects-list";

import SubjectFormModal from "@/components/smart/subject-modal";
import SubjectForm from "@/components/smart/subject-form";

import SemesterFormModal from "@/components/smart/semester-modal";
import SemesterForm from "@/components/smart/semester-form";

import SemesterList from "@/components/smart/semester-list";

import { type Subject, type Semester } from "@/types";

declare const __APP_VERSION__: string;

function App() {
    const appName = import.meta.env.VITE_APP_NAME || "My App";
    const appVersion = __APP_VERSION__;
    const localStorageSubjectsKey =
        import.meta.env.VITE_APP_LOCAL_STORAGE_SUBJECTS_KEY || "gwa_subjects";
    const localStorageSemestersKey =
        import.meta.env.VITE_APP_LOCAL_STORAGE_SEMESTERS_KEY || "gwa_semesters";
    const localStorageAutosaveKey =
        import.meta.env.VITE_APP_LOCAL_STORAGE_AUTOSAVE_KEY || "gwa_autosave";

    const [tab, setTab] = useState("current");

    const [gwa, setGwa] = useState<number | null>(null);
    const [honor, setHonor] = useState<string | null>(null);

    const [autosave, setAutosave] = useLocalStorage<boolean>(localStorageAutosaveKey, true, { enabled: true });

    const [subjects, setSubjects] = useLocalStorage<Subject[]>(localStorageSubjectsKey, [], { enabled: autosave });
    const [editingSubject, setEditingSubject] = useState<null | Subject>(null);
    const [semesters, setSemesters] = useLocalStorage<Semester[]>(localStorageSemestersKey, [], { enabled: autosave });
    const [editingSemester, setEditingSemester] = useState<null | Semester>(
        null
    );

    const pageSizeOptions = [5, 10, 20, 50];
    const [pageSize, setPageSize] = useState<number>(10);

    const [search, setSearch] = useState<string>("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [subjectModalOpen, setSubjectModalOpen] = useState(false);
    const [semesterModalOpen, setSemesterModalOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [congratsDialogOpen, setCongratsDialogOpen] = useState(false);
    const [saveSemesterDialogOpen, setSaveSemesterDialogOpen] = useState(false);

    const [collapsedSemesters, setCollapsedSemesters] = useState<Record<string, boolean>>({});

    const formRef = useRef<HTMLFormElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dirty, setDirty] = useState(true);

    // Handle Ctrl+F or Cmd+F to focus search input
    const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "f"
        ) {
            event.preventDefault();
            searchInputRef.current?.focus();
        }
    }, []);

    // Attach event listener to window
    useEventListener("keydown", handleKeyDown);

    // Recalculate GWA when subjects change
    useEffect(() => {
        if (subjects.length === 0) {
            setGwa(0);
            return;
        }

        // Calculate GWA
        const totalWeightedGrades = subjects.reduce(
            (acc, subject) => acc + subject.grade * subject.units,
            0
        );

        const totalUnits = subjects.reduce(
            (acc, subject) => acc + subject.units,
            0
        );

        const honor =
            totalUnits >= 12 && gwa !== null ? getAcademicHonor(gwa) : null;

        const calculatedGwa = totalWeightedGrades / totalUnits;

        setGwa(parseFloat(calculatedGwa.toFixed(3)));

        setHonor(honor);
    }, [subjects, gwa, honor, autosave]);

    // Save semesters to localStorage when changed
    useEffect(() => {
        localStorage.setItem(
            localStorageSemestersKey,
            JSON.stringify(semesters)
        );
    }, [semesters]);

    const handleCreate = async (values: any) => {
        if (processing) return;

        setProcessing(true);

        try {
            const newSubject: Subject = {
                id: crypto.randomUUID(),
                code: values.code,
                title: values.title,
                grade: values.grade,
                units: values.units,
            };

            await setSubjects((prev) => [...prev, newSubject]);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdate = async (values: any) => {
        if (!editingSubject) return;
        if (processing) return;

        setProcessing(true);

        try {
            setSubjects((prev) =>
                prev.map((subject) => {
                    if (subject.id === editingSubject.id) {
                        return {
                            id: editingSubject.id,
                            code: values.code,
                            title: values.title,
                            grade: values.grade,
                            units: values.units,
                        };
                    }
                    return subject;
                })
            );
        } finally {
            setSubjectModalOpen(false);
            setProcessing(false);
        }
        
    };

    const handleDelete = (subject: Subject) => {
        if (processing) return;

        setProcessing(true);

        try {
            setSubjects((prev) => {
                const updated = prev.filter((s) => s.id !== subject.id);
                localStorage.setItem(
                    localStorageSubjectsKey,
                    JSON.stringify(updated)
                );
                return updated;
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleReset = () => {
        setSubjects([]);
        setGwa(0);
        setHonor(null);
        setResetDialogOpen(false);
        localStorage.removeItem(localStorageSubjectsKey);
    };

    const handleCreateSemester = async (values: any) => {
        if (processing) return;

        setProcessing(true);

        try {
            const newSemester: Semester = {
                id: crypto.randomUUID(),
                semester: values.semester,
                schoolYear: values.schoolYear,
                subjects: subjects,
            };

            await setSemesters((prev) => [...prev, newSemester]);

            // After saving semester, reset subjects
            handleReset();
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateSemester = async (values: any) => {
        if (!editingSemester) return;
        if (processing) return;

        setProcessing(true);

        try {
            setSemesters((prev) =>
                prev.map((semester) => {
                    if (semester.id === editingSemester.id) {
                        return {
                            id: editingSemester.id,
                            semester: values.semester,
                            schoolYear: values.schoolYear,
                            subjects: semester.subjects,
                        };
                    }
                    return semester;
                })
            );
        } finally {
            setProcessing(false);
            setSemesterModalOpen(false);
        }
    };

    const handleDeleteSemester = (semester: Semester) => {
        if (processing) return;
        
        setProcessing(true);

        try {
            setSemesters((prev) => {
                const updated = prev.filter((s) => s.id !== semester.id);
                localStorage.setItem(
                    localStorageSemestersKey,
                    JSON.stringify(updated)
                );
                // If the deleted semester was being viewed, switch to current tab
                if (updated.length === 0) {
                    setTab("current");
                }
                return updated;
            });
        } finally {
            setProcessing(false);
        }
    };

    const handleToggleSemester = (id: string) => {
        setCollapsedSemesters(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const onSave = () => {

    };

    // Handle tab change
    const onTabChange = (value: string) => {
        setTab(value);
    }

    // Filter subjects by code or title
    const filteredSubjects = subjects.filter(
        (subject) =>
            subject.code.toLowerCase().includes(search.toLowerCase()) ||
            subject.title.toLowerCase().includes(search.toLowerCase()) ||
            subject.grade.toFixed(3).includes(search) ||
            subject.units.toString().includes(search)
    );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSubjects.length / pageSize)
    );
    const paginatedSubjects = filteredSubjects.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    useEffect(() => {
        // Reset to first page if filteredSubjects changes and currentPage is out of bounds
        if (currentPage > totalPages) setCurrentPage(1);
    }, [filteredSubjects, totalPages, currentPage]);

    return (
        <div className="flex flex-col items-center justify-center min-h-svh p-4">
            <main className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-3xl">
                    <div className="flex flex-row items-center justify-between w-full">
                        <AppHeader appName={appName} appVersion={appVersion} />
                        <ThemeSwitcher />
                    </div>
                    <Tabs value={tab} onValueChange={onTabChange}>
                        {semesters.length > 0 && (
                            <TabsList className="mt-8">
                                <TabsTrigger value="current">Current</TabsTrigger>
                                <TabsTrigger value="semesters">Semesters</TabsTrigger>
                            </TabsList>
                        )}
                        <TabsContent value="current">
                            <GWASummary gwa={gwa} honor={honor} semestersCount={semesters.length} />
                            <div className="flex flex-col gap-4 mt-8">
                                <SubjectsToolbar
                                    subjects={subjects}
                                    semesters={semesters}
                                    honor={honor}
                                    gwa={gwa}
                                    autosave={autosave}
                                    setAutosave={setAutosave}
                                    setSubjectModalOpen={setSubjectModalOpen}
                                    resetDialogOpen={resetDialogOpen}
                                    setResetDialogOpen={setResetDialogOpen}
                                    handleReset={handleReset}
                                    congratsDialogOpen={congratsDialogOpen}
                                    setCongratsDialogOpen={setCongratsDialogOpen}
                                    saveSemesterDialogOpen={saveSemesterDialogOpen}
                                    setSaveSemesterDialogOpen={setSaveSemesterDialogOpen}
                                    setSemesterModalOpen={setSemesterModalOpen}
                                    pageSize={pageSize}
                                    pageSizeOptions={pageSizeOptions}
                                    setPageSize={setPageSize}
                                    setCurrentPage={setCurrentPage}
                                    search={search}
                                    setSearch={setSearch}
                                    searchInputRef={searchInputRef}
                                    filteredSubjectsCount={filteredSubjects.length}
                                />
                                <SubjectList
                                    paginatedSubjects={paginatedSubjects}
                                    filteredSubjects={filteredSubjects}
                                    subjects={subjects}
                                    pageSize={pageSize}
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    setCurrentPage={setCurrentPage}
                                    handleDelete={handleDelete}
                                    setEditingSubject={setEditingSubject}
                                    setSubjectModalOpen={setSubjectModalOpen}
                                />
                            </div>
                        </TabsContent>
                        <TabsContent value="semesters" className="pt-4">
                            <SemesterList
                                semesters={semesters}
                                collapsedSemesters={collapsedSemesters}
                                onToggleSemester={handleToggleSemester}
                                onDeleteSemester={handleDeleteSemester}
                                setSemesterModalOpen={setSemesterModalOpen}
                                setEditingSemester={setEditingSemester}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <footer className="w-full flex justify-center py-6 bg-transparent">
                <KofiButton
                    username="yjaphzs"
                    label="Buy Me a Ko-fi"
                    preset="no_background"
                />
            </footer>

            {congratsDialogOpen && (
                <FireworksBackground
                    className="absolute inset-0 flex items-center justify-center rounded-xl"
                    fireworkSpeed={{ min: 8, max: 16 }}
                    fireworkSize={{ min: 4, max: 10 }}
                    particleSpeed={{ min: 4, max: 14 }}
                    particleSize={{ min: 2, max: 10 }}
                />
            )}

            <SubjectFormModal
                open={subjectModalOpen}
                onOpenChange={(open) => {
                    setSubjectModalOpen(open);
                    if (!open) setEditingSubject(null);
                }}
                onClose={() => setSubjectModalOpen(false)}
                onSave={() => formRef.current?.requestSubmit()}
                processing={processing}
                success={success}
                editingSubject={editingSubject}
                dirty={dirty}
            >
                <SubjectForm
                    ref={formRef}
                    subject={editingSubject}
                    subjects={subjects}
                    onSuccess={editingSubject ? handleUpdate : handleCreate}
                    inputRef={inputRef}
                    setModalOpen={setSubjectModalOpen}
                    setProcessing={setProcessing}
                    setSuccess={setSuccess}
                    setDirty={setDirty}
                />
            </SubjectFormModal>

            <SemesterFormModal
                open={semesterModalOpen}
                onOpenChange={(open) => {
                    setSemesterModalOpen(open);
                    if (!open) setEditingSemester(null);
                }}
                onClose={() => setSemesterModalOpen(false)}
                onSave={() => formRef.current?.requestSubmit()}
                processing={processing}
                success={success}
                editingSemester={editingSemester}
                dirty={dirty}
            >
                <SemesterForm
                    ref={formRef}
                    semester={editingSemester}
                    semesters={semesters}
                    subjects={subjects}
                    onSuccess={
                        editingSemester
                            ? handleUpdateSemester
                            : handleCreateSemester
                    }
                    inputRef={inputRef}
                    setModalOpen={setSemesterModalOpen}
                    setProcessing={setProcessing}
                    setSuccess={setSuccess}
                    setDirty={setDirty}
                />
            </SemesterFormModal>
        </div>
    );
}

export default App;
