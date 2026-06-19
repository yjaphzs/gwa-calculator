import type { FieldValue, Timestamp } from "firebase/firestore";

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

/**
 * The full calculator state that is persisted — to localStorage for guests, or
 * to Firestore (`users/{uid}/calculator/state`) for signed-in users.
 */
export interface CalculatorState {
    subjects: Subject[];
    semesters: Semester[];
    autosave: boolean;
}

/** Profile document stored at `users/{uid}`. */
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    createdAt: Timestamp | FieldValue;
    updatedAt?: Timestamp | FieldValue;
}
