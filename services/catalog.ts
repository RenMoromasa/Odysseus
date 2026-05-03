import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Course, Semester, Tag } from '../constants/types';

const PROGRAM_IDS: Record<string, string> = {
  'BS Computer Science': 'cs',
  'BS Information Systems': 'is',
  'BS Information Technology': 'it',
};

export function programIdFor(programName: string): string {
  const id = PROGRAM_IDS[programName];
  if (!id) throw new Error(`Unknown program: ${programName}`);
  return id;
}

export async function fetchCourseCatalog(programName: string): Promise<Course[]> {
  const snap = await getDocs(collection(db, 'programs', programIdFor(programName), 'courses'));
  const courses = snap.docs.map((d) => d.data() as Course);
  // Deduplicate by course ID (safety net)
  const seen = new Set<string>();
  return courses.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  });
}

export async function fetchSemesterTemplate(programName: string): Promise<Semester[]> {
  const snap = await getDocs(collection(db, 'programs', programIdFor(programName), 'semesters'));
  return snap.docs
    .map((d) => d.data() as Semester)
    .sort((a, b) => a.year - b.year || a.term - b.term);
}

export async function fetchDefaultTags(): Promise<Tag[]> {
  const snap = await getDocs(collection(db, 'tags'));
  return snap.docs.map((d) => d.data() as Tag);
}

export async function fetchProgram(programName: string) {
  const ref = doc(db, 'programs', programIdFor(programName));
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}
