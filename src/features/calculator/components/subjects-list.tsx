import React from "react";
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle,
    ItemActions,
} from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Pencil, Trash, SearchXIcon } from "lucide-react";
import Paginator from "@/components/smart/paginator";
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    EmptyDescription,
} from "@/components/ui/empty";

interface Subject {
    id: string;
    code: string;
    title: string;
    grade: number;
    units: number;
}

interface SubjectListProps {
    paginatedSubjects: Subject[];
    filteredSubjects: Subject[];
    subjects: Subject[];
    pageSize: number;
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
    handleDelete: (subject: Subject) => void;
    setEditingSubject: (subject: Subject | null) => void;
    setSubjectModalOpen: (open: boolean) => void;
}

const SubjectList: React.FC<SubjectListProps> = ({
    paginatedSubjects,
    filteredSubjects,
    subjects,
    pageSize,
    currentPage,
    totalPages,
    setCurrentPage,
    handleDelete,
    setEditingSubject,
    setSubjectModalOpen,
}) => (
    <>
        {paginatedSubjects.length > 0 && (
            <>
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
                                                setEditingSubject(subject);
                                                setSubjectModalOpen(true);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(subject)
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
            </>
        )}

        {filteredSubjects.length === 0 && subjects.length > 0 && (
            <Empty className="border border-dashed">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <SearchXIcon />
                    </EmptyMedia>
                    <EmptyTitle>No Results Found</EmptyTitle>
                    <EmptyDescription>
                        Try adjusting your search criteria to find what you're
                        looking for.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        )}
    </>
);

export default SubjectList;
