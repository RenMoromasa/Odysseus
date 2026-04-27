export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[]; // Course IDs
  tags: string[]; // Tag IDs
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

export interface SemesterCourse {
  courseId: string;
  grade?: string; // e.g. 'A', 'B+', 'C', etc.
}

export type SemesterStatus = 'completed' | 'in-progress' | 'planned';

export interface Semester {
  id: string;
  label: string; // e.g. "1st Year — 1st Sem"
  shortLabel: string; // e.g. "Y1 S1"
  year: number;
  term: number;
  status: SemesterStatus;
  courses: SemesterCourse[];
}

export interface StudentInfo {
  name: string;
  program: string;
  yearLevel: number;
  studentId: string;
}

export interface StudentPlanState {
  semesters: Semester[];
  customTags: Tag[];
  studentInfo: StudentInfo;
}

export const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

export const GRADE_OPTIONS = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];

export type StudentPlanAction =
  | { type: 'ADD_COURSE_TO_SEMESTER'; semesterId: string; courseId: string }
  | { type: 'REMOVE_COURSE_FROM_SEMESTER'; semesterId: string; courseId: string }
  | { type: 'MOVE_COURSE'; fromSemesterId: string; toSemesterId: string; courseId: string }
  | { type: 'SET_GRADE'; semesterId: string; courseId: string; grade: string }
  | { type: 'CLEAR_GRADE'; semesterId: string; courseId: string }
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'UPDATE_TAG'; tagId: string; updates: Partial<Tag> }
  | { type: 'DELETE_TAG'; tagId: string }
  | { type: 'RESET_PLAN' };
