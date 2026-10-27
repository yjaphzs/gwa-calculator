export interface ExampleSubject {
  title: string;
  grade: number;
  units: number;
}

/** The worked example: 24.25 ÷ 16 = 1.515625 → 1.516 (College Scholar). */
export const WORKED_EXAMPLE: readonly ExampleSubject[] = [
  { title: "Calculus I", grade: 1.25, units: 3 },
  { title: "Physics for Engineers", grade: 1.75, units: 4 },
  { title: "Purposive Communication", grade: 1.5, units: 3 },
  { title: "Data Structures", grade: 1.0, units: 3 },
  { title: "Filipino sa Iba't Ibang Disiplina", grade: 2.0, units: 3 },
];

export interface ExampleSemester {
  label: string;
  subjects: ExampleSubject[];
}

/**
 * Two semesters with different loads, chosen so the unit-weighted cumulative
 * (1.667) visibly differs from the plain average of the semester GWAs (1.500).
 */
export const CUMULATIVE_EXAMPLE: readonly ExampleSemester[] = [
  {
    label: "First semester",
    subjects: [{ title: "12 units, all 1.00", grade: 1.0, units: 12 }],
  },
  {
    label: "Second semester",
    subjects: [{ title: "24 units, all 2.00", grade: 2.0, units: 24 }],
  },
];
