import {
  Course,
  Semester,
  StudentInfo,
  StudentPlanAction,
  StudentPlanState,
  Tag,
} from '@/constants/types';
import { TagColors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchCourseCatalog,
  fetchDefaultTags,
  fetchSemesterTemplate,
} from '@/services/catalog';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getPHDate } from '@/utils/semester';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';

const DEFAULT_STUDENT_INFO: StudentInfo = {
  name: '',
  program: '',
  yearLevel: 1,
  studentId: '',
};

const INITIAL_STATE: StudentPlanState = {
  semesters: [],
  customTags: [],
  studentInfo: DEFAULT_STUDENT_INFO,
};

// ─── Reducer ────────────────────────────────────────────────────────────────────
function studentPlanReducer(state: StudentPlanState, action: StudentPlanAction): StudentPlanState {
  switch (action.type) {
    case 'ADD_COURSE_TO_SEMESTER': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            // Guard: only add if course is not already in this semester
            ? sem.courses.some(c => c.courseId === action.courseId)
              ? sem
              : { ...sem, courses: [...sem.courses, { courseId: action.courseId }] }
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
    case 'SET_CUSTOM_NAME': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId
            ? {
                ...sem,
                courses: sem.courses.map(c =>
                  c.courseId === action.courseId ? { ...c, customName: action.customName } : c
                ),
              }
            : sem
        ),
      };
    }
    case 'SET_SEMESTER_STATUS': {
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId ? { ...sem, status: action.status } : sem
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
      return {
        ...state,
        studentInfo: { ...state.studentInfo, program: action.program },
        semesters: action.semesters,
      };
    }
    case 'RESET_PLAN': {
      return {
        ...state,
        semesters: action.semesters,
        customTags: [],
      };
    }
    case 'CLEAR_SEMESTER_COURSES': {
      // Wipe all courses from a specific semester (used before re-adding during onboarding)
      return {
        ...state,
        semesters: state.semesters.map(sem =>
          sem.id === action.semesterId ? { ...sem, courses: [] } : sem
        ),
      };
    }
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────────
interface StudentPlanContextType {
  state: StudentPlanState;
  dispatch: React.Dispatch<StudentPlanAction>;
  catalog: Course[];
  loading: boolean;
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
  estimateGraduation: () => { year: number; semester: number; label: string; delayed: boolean; onTrackLabel: string; remainingTime: string };
}

const StudentPlanContext = createContext<StudentPlanContextType | null>(null);

// Map the register form program names to Firestore program keys
const PROGRAM_NAME_MAP: Record<string, string> = {
  'BS - Computer Science': 'BS Computer Science',
  'BS - Information Systems': 'BS Information Systems',
  'BS - Information Technology': 'BS Information Technology',
  'BS Computer Science': 'BS Computer Science',
  'BS Information Systems': 'BS Information Systems',
  'BS Information Technology': 'BS Information Technology',
};

export function StudentPlanProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(studentPlanReducer, INITIAL_STATE);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [defaultTags, setDefaultTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const hasPlanLoaded = useRef(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load default tags once
  useEffect(() => {
    fetchDefaultTags()
      .then(setDefaultTags)
      .catch(err => console.error('Failed to load default tags:', err));
  }, []);

  // Sync student info from Firebase profile
  useEffect(() => {
    if (!profile) return;
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
  }, [profile]);

  // Load catalog + semester template (or saved plan) whenever the program changes
  useEffect(() => {
    const program = state.studentInfo.program;
    if (!program || !profile) return;
    let cancelled = false;
    setLoading(true);
    hasPlanLoaded.current = false;

    Promise.all([
      fetchCourseCatalog(program),
      fetchSemesterTemplate(program),
      getDoc(doc(db, 'users', profile.uid, 'plan', 'current')),
    ])
      .then(([cat, templateSems, savedPlanSnap]) => {
        if (cancelled) return;
        setCatalog(cat);

        // If user has a saved plan, use it; otherwise use the template
        if (savedPlanSnap.exists()) {
          const savedData = savedPlanSnap.data();
          dispatch({
            type: 'SET_PROGRAM',
            program,
            semesters: savedData.semesters as Semester[],
          });
        } else {
          dispatch({ type: 'SET_PROGRAM', program, semesters: templateSems });
        }

        hasPlanLoaded.current = true;
      })
      .catch(err => console.error(`Failed to load program "${program}":`, err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [state.studentInfo.program]);

  // Auto-save plan to Firestore when semesters change (debounced)
  useEffect(() => {
    if (!profile || !hasPlanLoaded.current) return;
    if (state.semesters.length === 0) return;

    // Debounce saves to avoid hammering Firestore on rapid changes
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      setDoc(doc(db, 'users', profile.uid, 'plan', 'current'), {
        semesters: state.semesters,
        customTags: state.customTags,
        updatedAt: new Date().toISOString(),
      }).catch(err => console.error('Failed to save plan:', err));
    }, 1500);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state.semesters, state.customTags, profile]);

  const getCourse = useCallback((id: string) => {
    return catalog.find(c => c.id === id);
  }, [catalog]);

  /** Enforce canonical colors from TagColors for default tags */
  const applyCanonicalColor = useCallback((tag: Tag): Tag => {
    if (tag.isDefault && tag.id in TagColors) {
      return { ...tag, color: TagColors[tag.id] };
    }
    return tag;
  }, []);

  const getAllTags = useCallback(() => {
    return [...defaultTags, ...state.customTags].map(applyCanonicalColor);
  }, [defaultTags, state.customTags, applyCanonicalColor]);

  const getTagById = useCallback((id: string) => {
    const tag = [...defaultTags, ...state.customTags].find(t => t.id === id);
    return tag ? applyCanonicalColor(tag) : undefined;
  }, [defaultTags, state.customTags, applyCanonicalColor]);

  const isCourseCompleted = useCallback((courseId: string) => {
    return state.semesters.some(
      sem => sem.status === 'completed' && sem.courses.some(c => c.courseId === courseId && c.grade && c.grade !== '5.00' && c.grade !== 'NC')
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
    let gradedCredits = 0;   // credits that have a grade (for GPA denominator)
    let completedCredits = 0; // credits with a passing grade
    let allCredits = 0;       // total credits in the entire curriculum (deduplicated)

    // Deduplicate: track which courseIds we've already counted
    const seenForTotal = new Set<string>();
    const seenForCompleted = new Set<string>();

    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        const course = catalog.find(c => c.id === sc.courseId);
        if (!course) continue;

        // Total units — count each unique course only once
        if (!seenForTotal.has(sc.courseId)) {
          allCredits += course.credits;
          seenForTotal.add(sc.courseId);
        }

        // Graded units — count every graded entry for GPA calculation
        const gradeVal = sc.grade === 'NC' ? 5.00 : sc.grade ? parseFloat(sc.grade) : NaN;
        if (sc.grade && !isNaN(gradeVal)) {
          totalPoints += gradeVal * course.credits;
          gradedCredits += course.credits;
        }

        // Completed (passing) units — count each course once, first passing grade wins
        if (
          sc.grade &&
          sc.grade !== '5.00' &&
          sc.grade !== 'NC' &&
          !seenForCompleted.has(sc.courseId)
        ) {
          completedCredits += course.credits;
          seenForCompleted.add(sc.courseId);
        }
      }
    }

    return {
      overall: gradedCredits > 0 ? totalPoints / gradedCredits : 0,
      completed: gradedCredits,
      totalCredits: allCredits,
      completedCredits,
    };
  }, [state.semesters, catalog]);

  const getSemesterGPA = useCallback((semesterId: string) => {
    const sem = state.semesters.find(s => s.id === semesterId);
    if (!sem) return 0;
    let points = 0;
    let credits = 0;
    const seen = new Set<string>();
    for (const sc of sem.courses) {
      if (seen.has(sc.courseId)) continue; // skip duplicates
      seen.add(sc.courseId);
      const course = catalog.find(c => c.id === sc.courseId);
      const gradeVal = sc.grade === 'NC' ? 5.00 : sc.grade ? parseFloat(sc.grade) : NaN;
      if (!course || !sc.grade || isNaN(gradeVal)) continue;
      points += gradeVal * course.credits;
      credits += course.credits;
    }
    return credits > 0 ? points / credits : 0;
  }, [state.semesters, catalog]);

  const checkPrerequisiteConflicts = useCallback((semesterId: string, courseId: string) => {
    const course = catalog.find(c => c.id === courseId);
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
  }, [state.semesters, catalog]);

  const forecastGPA = useCallback((hypotheticalGrades: Record<string, string>) => {
    let totalPoints = 0;
    let totalCredits = 0;

    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        const course = catalog.find(c => c.id === sc.courseId);
        if (!course) continue;
        const grade = hypotheticalGrades[sc.courseId] || sc.grade;
        const gradeVal = grade === 'NC' ? 5.00 : grade ? parseFloat(grade) : NaN;
        if (grade && !isNaN(gradeVal)) {
          totalPoints += gradeVal * course.credits;
          totalCredits += course.credits;
        }
      }
    }

    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }, [state.semesters, catalog]);

  // ─── Graduation Estimation ─────────────────────────────────────────────────
  const estimateGraduation = useCallback(() => {
    if (catalog.length === 0 || state.semesters.length === 0) {
      return { year: 0, semester: 0, label: '—', delayed: false, onTrackLabel: '—', remainingTime: '—' };
    }

    // 1. Build set of passed course IDs
    const passedIds = new Set<string>();
    for (const sem of state.semesters) {
      for (const sc of sem.courses) {
        if (sc.grade && sc.grade !== '5.00' && sc.grade !== 'NC') passedIds.add(sc.courseId);
      }
    }

    // 2. Courses still needed
    const remaining = catalog.filter(c => !passedIds.has(c.id));
    if (remaining.length === 0) {
      // Already done
      const lastSem = state.semesters[state.semesters.length - 1];
      return { year: lastSem.year, semester: lastSem.term, label: 'Completed!', delayed: false, onTrackLabel: 'Graduated', remainingTime: 'Completed' };
    }

    // 3. Find the longest prerequisite chain depth among remaining courses
    //    This tells us the minimum number of sequential semesters needed
    const courseMap = new Map(catalog.map(c => [c.id, c]));
    const chainCache = new Map<string, number>();

    function chainDepth(courseId: string, visited: Set<string>): number {
      if (chainCache.has(courseId)) return chainCache.get(courseId)!;
      if (visited.has(courseId)) return 0; // cycle guard
      visited.add(courseId);

      const course = courseMap.get(courseId);
      if (!course) return 0;

      // Only count prerequisites that are NOT yet passed
      const unmetPrereqs = course.prerequisites.filter(id => !passedIds.has(id));
      if (unmetPrereqs.length === 0) {
        chainCache.set(courseId, 1);
        return 1;
      }

      let maxChildDepth = 0;
      for (const prereqId of unmetPrereqs) {
        maxChildDepth = Math.max(maxChildDepth, chainDepth(prereqId, visited));
      }

      const depth = maxChildDepth + 1;
      chainCache.set(courseId, depth);
      return depth;
    }

    let longestChain = 0;
    for (const c of remaining) {
      longestChain = Math.max(longestChain, chainDepth(c.id, new Set()));
    }

    // 4. Count remaining regular semesters (term 1 & 2, skip summer/term 3)
    const futureSems = state.semesters.filter(s => {
      if (s.status === 'completed') return false;
      // Only count regular semesters (term 1 and 2)
      return s.term === 1 || s.term === 2;
    });

    // The nominal last semester in the plan
    const allRegularSems = state.semesters.filter(s => s.term === 1 || s.term === 2);
    const lastPlannedSem = allRegularSems[allRegularSems.length - 1];

    // 5. If the longest prereq chain fits within remaining semesters, on track
    //    Otherwise, graduation is delayed
    const semsNeeded = Math.max(longestChain, Math.ceil(remaining.length / 8)); // ~8 courses per sem max
    const semsAvailable = futureSems.length;

    let gradYear: number;
    let gradTerm: number;
    let delayed = false;

    if (semsNeeded <= semsAvailable && lastPlannedSem) {
      // On track — graduate at end of last planned semester
      gradYear = lastPlannedSem.year;
      gradTerm = lastPlannedSem.term;
    } else {
      // Delayed — need extra semesters beyond the plan
      delayed = true;
      const extraSems = semsNeeded - semsAvailable;
      if (lastPlannedSem) {
        let yr = lastPlannedSem.year;
        let tm = lastPlannedSem.term;
        for (let i = 0; i < extraSems; i++) {
          if (tm === 1) {
            tm = 2;
          } else {
            tm = 1;
            yr += 1;
          }
        }
        gradYear = yr;
        gradTerm = tm;
      } else {
        gradYear = state.studentInfo.yearLevel + Math.ceil(semsNeeded / 2);
        gradTerm = semsNeeded % 2 === 0 ? 2 : 1;
      }
    }

    // 6. Convert to calendar year estimate
    //    Assuming Year 1 started in the current academic year minus (yearLevel - 1)
    const currentCalendarYear = getPHDate().getFullYear();
    const startYear = currentCalendarYear - (state.studentInfo.yearLevel - 1);
    const estimatedCalendarYear = startYear + gradYear;
    const termLabel = gradTerm === 1 ? '1st Sem' : '2nd Sem';

    const label = `~${termLabel} ${estimatedCalendarYear}`;
    const onTrackLabel = delayed ? 'Delayed' : 'On Track';

    // 7. Calculate remaining time
    const remainingSems = Math.max(semsNeeded, 0);
    if (remainingSems === 0) {
      return { year: gradYear, semester: gradTerm, label, delayed, onTrackLabel, remainingTime: 'Completed' };
    }
    const remYears = Math.floor(remainingSems / 2);
    const remSems = remainingSems % 2;
    let remainingTime = '';
    if (remYears > 0) remainingTime += `${remYears} year${remYears !== 1 ? 's' : ''}`;
    if (remYears > 0 && remSems > 0) remainingTime += ', ';
    if (remSems > 0) remainingTime += `${remSems} semester${remSems !== 1 ? 's' : ''}`;
    if (!remainingTime) remainingTime = 'Less than a semester';

    return { year: gradYear, semester: gradTerm, label, delayed, onTrackLabel, remainingTime };
  }, [catalog, state.semesters, state.studentInfo.yearLevel]);

  const value = useMemo(() => ({
    state, dispatch, catalog, loading,
    getCourse, getAllTags, getTagById,
    calculateGPA, getSemesterGPA, checkPrerequisiteConflicts,
    isCourseCompleted, getCourseGrade, getCourseSemester, forecastGPA,
    estimateGraduation,
  }), [state, dispatch, catalog, loading, getCourse, getAllTags, getTagById,
       calculateGPA, getSemesterGPA, checkPrerequisiteConflicts,
       isCourseCompleted, getCourseGrade, getCourseSemester, forecastGPA,
       estimateGraduation]);


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
