import React, { useState } from "react";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { ChevronsUpDown, Pencil, Medal, Trash, MoreHorizontalIcon } from "lucide-react";
import { getAcademicHonor } from "@/lib/academic";
import type { Semester } from "@/types";

// Helper for semester order
const semesterOrder = {
    Third: 3,
    Second: 2,
    First: 1,
} as const;

interface SemesterListProps {
    semesters: Semester[];
    collapsedSemesters: Record<string, boolean>;
    onToggleSemester: (id: string) => void;
    onDeleteSemester: (semester: Semester) => void;
    setSemesterModalOpen: (open: boolean) => void;
    setEditingSemester: (semester: Semester | null) => void;
}

const SemesterList: React.FC<SemesterListProps> = ({
    semesters,
    collapsedSemesters,
    onToggleSemester,
    onDeleteSemester,
    setSemesterModalOpen,
    setEditingSemester,
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

    // Sort semesters by schoolYear (desc), then semester (Third > Second > First)
    const sortedSemesters = [...semesters].sort((a, b) => {
        const aYear = parseInt(a.schoolYear.split("-")[0], 10);
        const bYear = parseInt(b.schoolYear.split("-")[0], 10);

        if (aYear !== bYear) {
            return bYear - aYear; // Descending by school year
        }
        // Descending by semester order (Third > Second > First)
        return (
            semesterOrder[b.semester as keyof typeof semesterOrder] -
            semesterOrder[a.semester as keyof typeof semesterOrder]
        );
    });

    return (
        <div className="flex flex-col gap-4">
            {sortedSemesters.map((semester) => (
                <Item key={semester.id} variant="outline" className="items-start">
                    <ItemContent>
                        <ItemTitle className="flex flex-row w-full justify-between items-start">
                            <div className="flex flex-col">
                                <div className="text-xl font-black">
                                    S.Y. {semester.schoolYear}
                                </div>
                                <div className="font-normal text-muted-foreground">
                                    {semester.semester} Semester
                                </div>
                            </div>
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
                                        <DropdownMenuItem
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                setSemesterModalOpen(true);
                                                setEditingSemester(semester);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <AlertDialog
                                            open={deleteDialogOpen === semester.id}
                                            onOpenChange={(open) => {
                                                if (!open) setDeleteDialogOpen(null);
                                            }}
                                        >
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        setDeleteDialogOpen(semester.id);
                                                    }}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <Trash className="size-10 border rounded-lg bg-primary text-primary-foreground p-2" />
                                                    <AlertDialogTitle>
                                                        Delete this semester?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be
                                                        undone. This will
                                                        permanently delete all
                                                        your subjects under <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">S.Y.{" "}
                                                        {semester.schoolYear} -{" "}
                                                        {semester.semester} Semester.
                                                        </code>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel onClick={() => setDeleteDialogOpen(null)}>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() => {
                                                            onDeleteSemester(semester);
                                                            setDeleteDialogOpen(null);
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ItemTitle>
                        <ItemDescription className="mt-4">
                            {(() => {
                                const totalUnits = semester.subjects.reduce(
                                    (acc, s) => acc + s.units,
                                    0
                                );
                                const totalWeightedGrades =
                                    semester.subjects.reduce(
                                        (acc, s) => acc + s.grade * s.units,
                                        0
                                    );
                                const gwa = totalUnits
                                    ? totalWeightedGrades / totalUnits
                                    : 0;
                                const honor =
                                    totalUnits >= 12 && gwa !== null
                                        ? getAcademicHonor(gwa)
                                        : null;
                                return (
                                    <div className="flex flex-col justify-center items-center border border-dashed p-4 rounded-lg bg-muted/30">
                                        {honor && (
                                            <Badge
                                                variant="secondary"
                                                className="mb-2"
                                            >
                                                <Medal className="text-primary" />
                                                {honor}
                                            </Badge>
                                        )}
                                        <div className="text-3xl font-mono font-bold">
                                            {gwa.toFixed(3)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            GWA
                                        </div>
                                    </div>
                                );
                            })()}
                            <Collapsible
                                open={!!collapsedSemesters[semester.id]}
                                onOpenChange={() => onToggleSemester(semester.id)}
                                className="flex flex-col gap-2 mt-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <h4 className="text-sm font-semibold">
                                        There are{" "}
                                        <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold">
                                            {semester.subjects.length}
                                        </code>{" "}
                                        subjects archived in this semester
                                    </h4>
                                    {semester.subjects &&
                                        semester.subjects.length > 1 && (
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                >
                                                    <ChevronsUpDown />
                                                    <span className="sr-only">
                                                        Toggle
                                                    </span>
                                                </Button>
                                            </CollapsibleTrigger>
                                        )}
                                </div>
                                {semester.subjects &&
                                    semester.subjects.length > 0 && (
                                        <div className="flex flex-row justify-between items-center rounded-md border px-4 py-2 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">
                                                    {semester.subjects[0].code}
                                                </span>
                                                <span className="font-semibold line-clamp-1">
                                                    {semester.subjects[0].title}
                                                </span>
                                            </div>
                                            <div className="flex flex-col justify-end text-end">
                                                <span className="text-xs text-muted-foreground">
                                                    {semester.subjects[0].units}
                                                </span>
                                                <span className="font-bold line-clamp-1 font-mono">
                                                    {semester.subjects[0].grade.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                <CollapsibleContent className="flex flex-col gap-2">
                                    {semester.subjects &&
                                        semester.subjects
                                            .slice(1)
                                            .map((subject) => (
                                                <div
                                                    key={subject.code}
                                                    className="flex flex-row justify-between items-center rounded-md border px-4 py-2 text-sm"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-muted-foreground">
                                                            {subject.code}
                                                        </span>
                                                        <span className="font-semibold line-clamp-1">
                                                            {subject.title}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col justify-end text-end">
                                                        <span className="text-xs text-muted-foreground">
                                                            {subject.units}
                                                        </span>
                                                        <span className="font-bold line-clamp-1 font-mono">
                                                            {subject.grade.toFixed(
                                                                2
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                </CollapsibleContent>
                            </Collapsible>
                        </ItemDescription>
                    </ItemContent>
                </Item>
            ))}
        </div>
    );
};

export default SemesterList;
