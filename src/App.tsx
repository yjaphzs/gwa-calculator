import { useState, useRef, useEffect } from "react";
import AppHeader from "@/components/dom/app-header";
import ThemeSwitcher from "@/components/ui/theme-switcher";
import KofiButton from "@/components/dom/KofiButton";
import {
    Pencil,
    Search,
    Album,
    Trash,
    PlusIcon,
    RotateCcw,
    Medal,
    PartyPopper
} from "lucide-react";
import { CopyButton } from "@/components/ui/shadcn-io/copy-button";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import Paginator from "@/components/smart/paginator";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
    ItemActions,
} from "@/components/ui/item";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { FireworksBackground } from '@/components/ui/shadcn-io/fireworks-background';
import { getAcademicHonor } from "@/lib/academic";

import SubjectFormModal from "@/components/smart/subject-modal";
import SubjectForm from "@/components/smart/subject-form";

import { type Subject } from "@/types";

function App() {
    const appName = import.meta.env.VITE_APP_NAME || "My App";
    const appVersion = import.meta.env.VITE_APP_VERSION || "0.1.0";
    const localStorageKey =
        import.meta.env.VITE_APP_LOCAL_STORAGE_KEY || "gwa_subjects";

    const [gwa, setGwa] = useState<number | null>(null);
    const [honor, setHonor] = useState<string | null>(null);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [editingSubject, setEditingSubject] = useState<null | Subject>(null);

    const pageSizeOptions = [5, 10, 20, 50];
    const [pageSize, setPageSize] = useState<number>(10);
    const [search, setSearch] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [congratsDialogOpen, setCongratsDialogOpen] = useState(false);

    const formRef = useRef<HTMLFormElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dirty, setDirty] = useState(true);

    // Load subjects from localStorage on mount
    useEffect(() => {
        const storedSubjects = localStorage.getItem(localStorageKey);
        if (storedSubjects) {
            setSubjects(JSON.parse(storedSubjects));
        }
    }, []);

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

        localStorage.setItem(localStorageKey, JSON.stringify(subjects));
    }, [subjects, gwa, honor]);

    const handleCreate = async (values: any) => {
        setProcessing(true);

        const newSubject: Subject = {
            id: crypto.randomUUID(),
            code: values.code,
            title: values.title,
            grade: values.grade,
            units: values.units,
        };

        setSubjects((prev) => [...prev, newSubject]);

        setProcessing(false);
    };

    const handleUpdate = async (values: any) => {
        if (!editingSubject) return;

        setProcessing(true);

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

        setProcessing(false);
        setModalOpen(false);
    };

    const handleDelete = (subject: Subject) => {
        setSubjects((prev) => {
            const updated = prev.filter((s) => s.id !== subject.id);
            localStorage.setItem(localStorageKey, JSON.stringify(updated));
            return updated;
        });
    };

    const handleReset = () => {
        setSubjects([]);
        setGwa(0);
        setResetDialogOpen(false);
        localStorage.removeItem(localStorageKey);
    };

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
                    <div className="flex flex-col gap-2 bg-muted/30 rounded-lg w-full mt-8 py-12 px-8">
                        <div className="flex justify-end">
                            {honor && (
                                <Badge variant="secondary">
                                    <Medal className="text-primary" />
                                    {honor}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <CopyButton
                                variant="default"
                                size="lg"
                                content={
                                    gwa !== null && gwa !== 0
                                        ? gwa.toFixed(3)
                                        : "0"
                                }
                            />
                            <div className="text-end text-6xl font-mono font-bold">
                                {gwa !== null && gwa !== 0
                                    ? gwa.toFixed(3)
                                    : "0"}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mt-8">
                        {subjects.length === 0 ? (
                            <Empty className="border border-dashed">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Album />
                                    </EmptyMedia>
                                    <EmptyTitle>No Subjects Found</EmptyTitle>
                                    <EmptyDescription>
                                        Add subjects to get started. Your
                                        subjects will appear here and you’ll be
                                        able to view, edit, and calculate your
                                        GWA as you go.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        Add Subject
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : (
                            <div className="flex flex-row flex-wrap-reverse gap-2 items-center justify-between w-full">
                                <Select
                                    value={String(pageSize)}
                                    onValueChange={value => {
                                        setCurrentPage(1);
                                        setPageSize(Number(value));
                                    }}
                                >
                                    <SelectTrigger className="w-20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pageSizeOptions.map(size => (
                                            <SelectItem key={size} value={String(size)}>
                                                {size}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ButtonGroup>
                                    {honor && (
                                        <ButtonGroup>
                                            <AlertDialog open={congratsDialogOpen} onOpenChange={setCongratsDialogOpen}>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="default"
                                                        onClick={() => setCongratsDialogOpen(true)}
                                                    >
                                                        <PartyPopper className="size-4" />
                                                        Congratulate
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader className="items-center">
                                                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary">
                                                            <PartyPopper className="size-6 text-primary-foreground" />
                                                        </div>
                                                        <AlertDialogTitle className="text-2xl">Congratulations!</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-md text-center">
                                                            You've achieved the academic honor of <strong>{honor}</strong> with a GWA of <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">{gwa?.toFixed(3)}</code>! Keep up the excellent work!
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel onClick={() => setCongratsDialogOpen(false)}>
                                                            Close
                                                        </AlertDialogCancel>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </ButtonGroup>
                                    )}
                                    <ButtonGroup>
                                        <Button
                                            variant="outline"
                                            onClick={() => setModalOpen(true)}
                                        >
                                            <PlusIcon className="size-4" />
                                            Add
                                        </Button>
                                        <AlertDialog
                                            open={resetDialogOpen}
                                            onOpenChange={setResetDialogOpen}
                                        >
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        setResetDialogOpen(true)
                                                    }
                                                >
                                                    <RotateCcw className="size-4" />
                                                    Reset
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Are you absolutely sure?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone.
                                                        This will permanently delete all
                                                        your subjects and reset your
                                                        GWA.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleReset}
                                                    >
                                                        Continue
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </ButtonGroup>
                                </ButtonGroup>
                            </div>
                        )}
                        {subjects.length > 0 && (
                            <div className="w-full flex justify-end">
                                <InputGroup className="sm ml-auto">
                                    <InputGroupInput
                                        placeholder="Search subjects..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                    />
                                    <InputGroupAddon>
                                        <Search className="size-4 text-muted-foreground" />
                                    </InputGroupAddon>
                                    <InputGroupAddon
                                        align="inline-end"
                                        className="text-muted-foreground"
                                    >
                                        {filteredSubjects.length} results
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        )}
                        {paginatedSubjects.length > 0 && (
                            <ItemGroup className="gap-4 mt-4">
                                {paginatedSubjects.map((subject) => (
                                    <Item
                                        key={subject.id}
                                        variant="outline"
                                        asChild
                                        role="listitem"
                                    >
                                        <div className="flex items-center w-full">
                                            <ItemContent>
                                                <ItemTitle className="line-clamp-1 text-muted-foreground">
                                                    {subject.code}
                                                </ItemTitle>
                                                <ItemDescription className="text-xl font-semibold line-clamp-1">
                                                    {subject.title}
                                                </ItemDescription>
                                            </ItemContent>
                                            <ItemContent>
                                                <ItemTitle className="line-clamp-1 text-muted-foreground w-full text-end">
                                                    {subject.units}
                                                </ItemTitle>
                                                <ItemDescription className="text-2xl font-bold line-clamp-1 font-mono w-full text-end">
                                                    {subject.grade.toFixed(2)}
                                                </ItemDescription>
                                            </ItemContent>
                                            <ItemActions>
                                                <ButtonGroup
                                                    orientation="vertical"
                                                    aria-label="Media controls"
                                                    className="h-fit"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => {
                                                            setEditingSubject(
                                                                subject
                                                            );
                                                            setModalOpen(true);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                subject
                                                            )
                                                        }
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </Button>
                                                </ButtonGroup>
                                            </ItemActions>
                                        </div>
                                    </Item>
                                ))}
                            </ItemGroup>
                        )}

                        {paginatedSubjects.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
                                <div className="text-muted-foreground text-sm">
                                    Showing {(currentPage - 1) * pageSize + 1}
                                    {" - "}
                                    {Math.min(
                                        currentPage * pageSize,
                                        filteredSubjects.length
                                    )}
                                    {" of "}
                                    {filteredSubjects.length} row(s)
                                </div>
                                <div className="flex justify-end">
                                    <Paginator
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        showPreviousNext
                                    />
                                </div>
                            </div>
                        )}

                        {filteredSubjects.length === 0 &&
                            subjects.length > 0 && (
                                <div className="flex flex-row items-center justify-center bg-muted rounded-lg py-12 px-4 gap-4">
                                    <span className="text-muted-foreground">
                                        No subjects match your search.
                                    </span>
                                </div>
                            )}
                    </div>
                </div>
            </main>

            <footer className="w-full flex justify-center py-6 bg-transparent">
                <KofiButton
                    username="yjaphzs"
                    label="Buy Me a Ko-fi"
                    preset="no_background"
                />
            </footer>

            { congratsDialogOpen && (
                <FireworksBackground
                    className="absolute inset-0 flex items-center justify-center rounded-xl"
                    fireworkSpeed={{ min: 8, max: 16 }}
                    fireworkSize={{ min: 4, max: 10 }}
                    particleSpeed={{ min: 4, max: 14 }}
                    particleSize={{ min: 2, max: 10 }}
                />
            )}

            <SubjectFormModal
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingSubject(null);
                }}
                onClose={() => setModalOpen(false)}
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
                    setModalOpen={setModalOpen}
                    setProcessing={setProcessing}
                    setSuccess={setSuccess}
                    setDirty={setDirty}
                />
            </SubjectFormModal>
        </div>
    );
}

export default App;
