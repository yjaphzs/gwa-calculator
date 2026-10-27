import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { ArchivedSubjects, CountChip } from "@/features/semesters/components/archived-subjects";
import { SemesterActionsMenu } from "@/features/semesters/components/semester-actions-menu";
import { SemesterGwaTile } from "@/features/semesters/components/semester-gwa-tile";
import type { Semester, Subject } from "@/types";

export interface SemesterCardActions {
  onReport: (semester: Semester) => void;
  onEdit: (semester: Semester) => void;
  onDelete: (semester: Semester) => void;
  /** Edit one subject of this saved semester (grade, status, units). */
  onEditSubject: (semester: Semester, subject: Subject) => void;
}

interface SemesterCardProps {
  semester: Semester;
  expanded: boolean;
  onToggle: (id: string) => void;
  actions: SemesterCardActions;
}

/** One saved semester: term heading, actions, GWA tile, archived subjects. */
export function SemesterCard({ semester, expanded, onToggle, actions }: SemesterCardProps) {
  return (
    <Item variant="outline" className="items-start">
      <ItemContent>
        <ItemTitle className="flex w-full flex-row items-start justify-between">
          <div className="flex flex-col">
            <div className="text-xl font-black">S.Y. {semester.schoolYear}</div>
            <div className="font-normal text-muted-foreground">
              {semester.semester} Semester
            </div>
          </div>
          <SemesterActionsMenu
            semester={semester}
            onReport={actions.onReport}
            onEdit={actions.onEdit}
            onDelete={actions.onDelete}
          />
        </ItemTitle>
        <div className="mt-4">
          <SemesterGwaTile subjects={semester.subjects} />
          <ArchivedSubjects
            subjects={semester.subjects}
            open={expanded}
            onOpenChange={() => onToggle(semester.id)}
            onEditSubject={(subject) => actions.onEditSubject(semester, subject)}
            className="mt-4 flex flex-col gap-2"
            heading={
              <>
                There are <CountChip>{semester.subjects.length}</CountChip> subjects archived in
                this semester
              </>
            }
          />
        </div>
      </ItemContent>
    </Item>
  );
}
