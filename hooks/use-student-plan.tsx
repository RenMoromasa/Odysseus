import { COURSE_CATALOG, DEFAULT_TAGS, INITIAL_STATE, PROGRAM_CATALOGS, PROGRAM_SEMESTERS } from '@/constants/mock-data';
import {
  Course,
  Semester,
  StudentPlanAction,
  StudentPlanState,
  Tag
} from '@/constants/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { useAuth } from '@/hooks/use-auth';

// ─── Reducer ────────────────────────────────────────────────────────────────────
function studentPlanReducer(state: StudentPlanState, action: StudentPlanAction): StudentPlanState {
  switch (action.type) {
    case 'ADD_COURSE_TO_SEMESTER': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            ? { ...sem, courses: [...sem.courses, { courseId: action.courseId }] }
            : sem
        ),
      };
    }
    case 'REMOVE_COURSE_FROM_SEMESTER': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            ? { ...sem, courses: sem.courses.filter(c => c.courseId !== action.courseId) }
            : sem
        ),
      };
    }
    case 'MOVE_COURSE': {
      const fromSem = state.semesters.find(s => s.id === action.fromSemesterId);
      const movingCourse = fromSem?.courses.find(c => c.courseId === action.courseId);
      if (!movingCourse) return state;
      return {
        ...state,
        semesters: state.semesters.map(sem => {
          if (sem.id === action.fromSemesterId) {
            return { ...sem, courses: sem.courses.filter(c => c.courseId !== action.courseId) };
          }
          if (sem.id === action.toSemesterId) {
            return { ...sem, courses: [...sem.courses, { courseId: action.courseId }] };
          }
          return sem;
        }),
      };
    }
    case 'SET_GRADE': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            ? {
                ...sem,
                courses: sem.courses.map(c =>
                  c.courseId === action.courseId ? { ...c, grade: action.grade } : c
                ),
              }
            : sem
        ),
      };
    }
    case 'CLEAR_GRADE': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            ? {
                ...sem,
                courses: sem.courses.map(c =>
                  c.courseId === action.courseId ? { courseId: c.courseId } : c
                ),
              }
            : sem
        ),
      };
    }
    case 'ADD_TAG': {
      return { ...state, customTags: [...state.customTags, action.tag] };
    }
    case 'UPDATE_TAG': {
      return {
        ...state,
        customTags: state.customTags.map(t =>
          t.id === action.tagId ? { ...t, ...action.updates } : t
        ),
      };
    }
    case 'DELETE_TAG': {
      return {
        ...state,
        customTags: state.customTags.filter(t => t.id !== action.tagId),
      };
    }
    case 'SET_STUDENT_INFO': {
      return { ...state, studentInfo: action.studentInfo };
    }
    case 'SET_PROGRAM': {
      return { ...state, studentInfo: { ...state.studentInfo, program: action.program }, semesters: action.semesters };
    }
    case 'RESET_PLAN': {
      return { ...INITIAL_STATE };
    }
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────────
interface StudentPlanContextType {
  state: StudentPlanState;
  dispatch: React.Dispatch<StudentPlanAction>;
  // Helpers
  courseCatalog: Course[];
  getCourse: (id: string) => Course | undefined;
  getAllTags: () => Tag[];
  getTagById: (id: string) => Tag | undefined;
  calculateGPA: () => { overall: number; completed: number; totalCredits: number; completedCredits: number };
  getSemesterGPA: (semesterId: string) => number;
  checkPrerequisiteConflicts: (semesterId: string, courseId: string) => string[];
  isCourseCompleted: (courseId: string) => boolean;
  getCourseGrade: (courseId: string) => string | undefined;
  getCourseSemester: (courseId: string) => Semester | undefined;
  forecastGPA: (hypotheticalGrades: Record<string, string>) => number;
}

const StudentPlanContext = createContext<StudentPlanContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────────
// Map the register form program names to the mock-data keys
const PROGRAM_NAME_MAP: Record<string, string> = {
  'BS - Computer Science': 'BS Computer Science',
  'BS - Information Systems': 'BS Information Systems',
  'BS - Information Technology': 'BS Information Technology',
  // Also allow direct keys
  'BS Computer Science': 'BS Computer Science',
  'BS Information Systems': 'BS Information Systems',
  'BS Information Technology': 'BS Information Technology',
};

export function StudentPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(studentPlanReducer, INITIAL_STATE);
  const { profile } = useAuth();

  // Sync student info from Firebase profile
  useEffect(() => {
    if (profile) {
      const programKey = PROGRAM_NAME_MAP[profile.program] || 'BS Computer Science';

      dispatch({
        type: 'SET_STUDENT_INFO',
        studentInfo: {
          name: `${profile.firstName} ${profile.lastName}`,
          program: programKey,
          yearLevel: profile.yearLevel || 1,
          studentId: profile.idNumber,
        },
      });

      // Load the correct semesters for the selected program
      const semesters = PROGRAM_SEMESTERS[programKey];
      if (semesters) {
        dispatch({ type: 'SET_PROGRAM', program: programKey, semesters });
      }
    }
  }, [profile]);

  // Get the active course catalog based on the student's program
  const activeCatalog = useMemo(() => {
    return PROGRAM_CATALOGS[state.studentInfo.program] || COURSE_CATALOG;
  }, [state.studentInfo.program]);

  const getCourse = useCallback((id: string) => {
    return activeCatalog.find(c => c.id === id);
  }, [activeCatalog]);

  const getAllTags = useCallback(() => {
    return [...DEFAULT_TAGS, ...state.customTags];
  }, [state.customTags]);

  const getTagById = useCallback((id: string) => {
    return [...DEFAULT_TAGS, ...state.customTags].find(t => t.id === id);
  }, [state.customTags]);

  const isCourseCompleted = useCallback((courseId: string) => {
    return state.semesters.some(
      sem => sem.status === 'completed' && sem.courses.some(c => c.courseId === courseId && c.grade && c.grade !== '5.00')
    );
  }, [state.semesters]);

  const getCourseGrade = useCallback((courseId: string) => {
    for (const sem of state.semesters) {
      const course = sem.courses.find(c => c.courseId === courseId);
      if (course?.grade) return course.grade;
    }
    return undefined;
  }, [state.semesters]);

  const getCourseSemester = useCallback((courseId: string) => {
    return state.semesters.find(sem => sem.courses.some(c => c.courseId === courseId));
  }, [state.semesters]);

  const calculateGPA = useCallback(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let completedCredits = 0;
    let allCredits = 0;

    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        const course = activeCatalog.find(c => c.id === sc.courseId);
        if (!course) continue;
        allCredits += course.credits;
        const gradeNum = sc.grade ? parseFloat(sc.grade) : NaN;
        if (sc.grade && !isNaN(gradeNum)) {
          totalPoints += gradeNum * course.credits;
          totalCredits += course.credits;
          // Only count as completed if not failed (5.00)
          if (sc.grade !== '5.00') {
            completedCredits += course.credits;
          }
        }
      }
    }

    return {
      overall: totalCredits > 0 ? totalPoints / totalCredits : 0,
      completed: totalCredits,
      totalCredits: allCredits,
      completedCredits,
    };
  }, [state.semesters, activeCatalog]);

  const getSemesterGPA = useCallback((semesterId: string) => {
    const sem = state.semesters.find(s => s.id === semesterId);
    if (!sem) return 0;
    let points = 0;
    let credits = 0;
    for (const sc of sem.courses) {
      const course = activeCatalog.find(c => c.id === sc.courseId);
      const gradeNum = sc.grade ? parseFloat(sc.grade) : NaN;
      if (!course || !sc.grade || isNaN(gradeNum)) continue;
      points += gradeNum * course.credits;
      credits += course.credits;
    }
    return credits > 0 ? points / credits : 0;
  }, [state.semesters, activeCatalog]);

  const checkPrerequisiteConflicts = useCallback((semesterId: string, courseId: string) => {
    const course = activeCatalog.find(c => c.id === courseId);
    if (!course || course.prerequisites.length === 0) return [];

    const sem = state.semesters.find(s => s.id === semesterId);
    if (!sem) return [];

    const semIndex = state.semesters.indexOf(sem);
    const completedCourseIds = new Set<string>();

    for (let i = 0; i < semIndex; i++) {
      for (const sc of state.semesters[i].courses) {
        completedCourseIds.add(sc.courseId);
      }
    }

    return course.prerequisites.filter(prereqId => !completedCourseIds.has(prereqId));
  }, [state.semesters, activeCatalog]);

  const forecastGPA = useCallback((hypotheticalGrades: Record<string, string>) => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        const course = activeCatalog.find(c => c.id === sc.courseId);
        if (!course) continue;
        const grade = hypotheticalGrades[sc.courseId] || sc.grade;
        const gradeNum = grade ? parseFloat(grade) : NaN;
        if (grade && !isNaN(gradeNum)) {
          totalPoints += gradeNum * course.credits;
          totalCredits += course.credits;
        }
      }
    }

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [state.semesters, activeCatalog]);

  const value = useMemo(() => ({
    state, dispatch, courseCatalog: activeCatalog, getCourse, getAllTags, getTagById,
    calculateGPA, getSemesterGPA, checkPrerequisiteConflicts,
    isCourseCompleted, getCourseGrade, getCourseSemester, forecastGPA,
  }), [state, dispatch, activeCatalog, getCourse, getAllTags, getTagById, calculateGPA,
       getSemesterGPA, checkPrerequisiteConflicts, isCourseCompleted,
       getCourseGrade, getCourseSemester, forecastGPA]);

  return (
    <StudentPlanContext.Provider value={value}>
      {children}
    </StudentPlanContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────────
export function useStudentPlan() {
  const context = useContext(StudentPlanContext);
  if (!context) {
    throw new Error('useStudentPlan must be used within a StudentPlanProvider');
  }
  return context;
}
