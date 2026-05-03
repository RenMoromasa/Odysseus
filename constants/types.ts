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
  grade?: string; // e.g. '1.00', '1.75', '3.00', '5.00'
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
  '1.00': 1.00,
  '1.25': 1.25,
  '1.50': 1.50,
  '1.75': 1.75,
  '2.00': 2.00,
  '2.25': 2.25,
  '2.50': 2.50,
  '2.75': 2.75,
  '3.00': 3.00,
  '5.00': 5.00,
};

export const GRADE_OPTIONS = ['1.00', '1.25', '1.50', '1.75', '2.00', '2.25', '2.50', '2.75', '3.00', '5.00'];

export type StudentPlanAction =
  | { type: 'ADD_COURSE_TO_SEMESTER'; semesterId: string; courseId: string }
  | { type: 'REMOVE_COURSE_FROM_SEMESTER'; semesterId: string; courseId: string }
  | { type: 'MOVE_COURSE'; fromSemesterId: string; toSemesterId: string; courseId: string }
  | { type: 'SET_GRADE'; semesterId: string; courseId: string; grade: string }
  | { type: 'CLEAR_GRADE'; semesterId: string; courseId: string }
  | { type: 'SET_SEMESTER_STATUS'; semesterId: string; status: SemesterStatus }
  | { type: 'ADD_TAG'; tag: Tag }
  | { type: 'UPDATE_TAG'; tagId: string; updates: Partial<Tag> }
  | { type: 'DELETE_TAG'; tagId: string }
  | { type: 'SET_STUDENT_INFO'; studentInfo: StudentInfo }
  | { type: 'SET_PROGRAM'; program: string; semesters: Semester[] }
  | { type: 'RESET_PLAN'; semesters: Semester[] };
