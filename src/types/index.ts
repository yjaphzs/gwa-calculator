export interface Subject {
    id: string;
    code: string;
    title: string;
    grade: number;
    units: number;
}

export interface Semester {
    id: string;
    schoolYear: string;
    semester: string;
    subjects: Subject[];
}