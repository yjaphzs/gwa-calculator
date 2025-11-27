import React from "react";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
    EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
    PartyPopper,
    PlusIcon,
    RotateCcw,
    MoreHorizontalIcon,
    FileSpreadsheetIcon,
    ImportIcon,
    DownloadIcon,
    SaveIcon,
    SaveAllIcon,
    Album,
    Search,
    CommandIcon,
} from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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

import type { Subject, Semester } from "@/types";

interface SubjectsToolbarProps {
    subjects: Subject[];
    semesters: Semester[];
    honor: string | null;
    gwa: number | null;
    handleSave: () => void;
    autosave: boolean;
    setAutosave: (value: boolean) => void;
    setSubjectModalOpen: (open: boolean) => void;
    resetDialogOpen: boolean;
    setResetDialogOpen: (open: boolean) => void;
    handleReset: () => void;
    handleImport: () => void;
    handleExport: () => void;
    congratsDialogOpen: boolean;
    setCongratsDialogOpen: (open: boolean) => void;
    saveSemesterDialogOpen: boolean;
    setSaveSemesterDialogOpen: (open: boolean) => void;
    setSemesterModalOpen: (open: boolean) => void;
    pageSize: number;
    pageSizeOptions: number[];
    setPageSize: (size: number) => void;
    setCurrentPage: (page: number) => void;
    search: string;
    setSearch: (value: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    filteredSubjectsCount: number;
}

const SubjectsToolbar: React.FC<SubjectsToolbarProps> = ({
    subjects,
    semesters,
    honor,
    gwa,
    handleSave,
    autosave,
    setAutosave,
    setSubjectModalOpen,
    resetDialogOpen,
    setResetDialogOpen,
    handleReset,
    handleImport,
    handleExport,
    congratsDialogOpen,
    setCongratsDialogOpen,
    saveSemesterDialogOpen,
    setSaveSemesterDialogOpen,
    setSemesterModalOpen,
    pageSize,
    pageSizeOptions,
    setPageSize,
    setCurrentPage,
    search,
    setSearch,
    searchInputRef,
    filteredSubjectsCount,
}) => (
    <>
        {subjects.length === 0 && semesters.length === 0 ? (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Album />
                    </EmptyMedia>
                    <EmptyTitle>No Subjects Found</EmptyTitle>
                    <EmptyDescription>
                        Add subjects to get started and calculate your GWA as you go. You can also import your records if you have existing subject data.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubjectModalOpen(true)}
                        >
                            Add Subject
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleImport}
                        >
                            Import Data
                        </Button>
                    </div>
                </EmptyContent>
            </Empty>
        ) : subjects.length === 0 && semesters.length > 0 ? (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Album />
                    </EmptyMedia>
                    <EmptyTitle>No Subjects Found</EmptyTitle>
                    <EmptyDescription>
                        You have no subjects for this semester. Add subjects to begin tracking your grades. You can view your archived subjects in the semesters tab.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSubjectModalOpen(true)}
                    >
                        Add Subject
                    </Button>
                </EmptyContent>
            </Empty>
        ) : (
            <>
                <div className="flex flex-row flex-wrap-reverse gap-2 items-center justify-start sm:justify-end w-full">
                    <ButtonGroup className="flex-row-reverse sm:flex-row">
                        {honor && (
                            <ButtonGroup>
                                <AlertDialog
                                    open={congratsDialogOpen}
                                    onOpenChange={setCongratsDialogOpen}
                                >
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
                                            <AlertDialogTitle className="text-2xl">
                                                Congratulations!
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-md text-center">
                                                You've achieved the academic honor of{" "}
                                                <strong>{honor}</strong>{" "}
                                                with a GWA of{" "}
                                                <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                                                    {gwa?.toFixed(3)}
                                                </code>
                                                ! Keep up the excellent work!
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                onClick={() => setCongratsDialogOpen(false)}
                                            >
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
                                onClick={() => setSubjectModalOpen(true)}
                            >
                                <PlusIcon className="size-4" />
                                Add
                            </Button>
                            <AlertDialog
                                open={resetDialogOpen}
                                onOpenChange={setResetDialogOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">
                                        <RotateCcw className="size-4" />
                                        Reset
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <RotateCcw className="size-10 border rounded-lg bg-primary text-primary-foreground p-2 mx-auto sm:mx-0" />
                                        <AlertDialogTitle>
                                            Reset all subjects?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will
                                            permanently delete all your subjects and reset
                                            your GWA.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            onClick={handleReset}
                                        >
                                            Continue Reset
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        aria-label="More Options"
                                    >
                                        <MoreHorizontalIcon />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-52"
                                >
                                    <DropdownMenuGroup>
                                        <AlertDialog
                                            open={saveSemesterDialogOpen}
                                            onOpenChange={setSaveSemesterDialogOpen}
                                        >
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem
                                                    onSelect={(e) => e.preventDefault()}
                                                >
                                                    <FileSpreadsheetIcon />
                                                    Save Semester
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <FileSpreadsheetIcon className="size-10 border rounded-lg bg-primary text-primary-foreground p-2 mx-auto sm:mx-0" />
                                                    <AlertDialogTitle>
                                                        Save Semester
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to save this semester?
                                                        This will archive your current subjects and GWA.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="default"
                                                        onClick={() => {
                                                            setSaveSemesterDialogOpen(false);
                                                            setSemesterModalOpen(true);
                                                        }}
                                                    >
                                                        Confirm Save
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={handleImport}
                                        >
                                            <ImportIcon />
                                            Import
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExport}
                                        >
                                            <DownloadIcon />
                                            Export
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={handleSave}
                                        >
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
                                                    onValueChange={(value) =>
                                                        setAutosave(value === "enable")
                                                    }
                                                >
                                                    <DropdownMenuRadioItem value="enable">
                                                        Enable
                                                    </DropdownMenuRadioItem>
                                                    <DropdownMenuRadioItem value="disabled">
                                                        Disable
                                                    </DropdownMenuRadioItem>
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ButtonGroup>
                    </ButtonGroup>
                </div>
                <div className="w-full flex justify-end gap-2">
                    <Select
                        value={String(pageSize)}
                        onValueChange={(value) => {
                            setCurrentPage(1);
                            setPageSize(Number(value));
                        }}
                    >
                        <SelectTrigger className="w-20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputGroup className="sm ml-auto">
                        <InputGroupInput
                            ref={searchInputRef}
                            placeholder="Search subjects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputGroupAddon>
                            <Search className="size-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupAddon
                            align="inline-end"
                            className="text-muted-foreground"
                        >
                            {filteredSubjectsCount} results
                            <KbdGroup className="hidden sm:inline-flex">
                                <Kbd>
                                    <CommandIcon />
                                </Kbd>
                                <Kbd>K</Kbd>
                            </KbdGroup>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            </>
        )}
    </>
);

export default SubjectsToolbar;