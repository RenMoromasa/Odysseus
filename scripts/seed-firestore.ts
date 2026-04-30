/**
 * One-time Firestore seed. Run with: npm run seed
 *
 * Writes the curriculum (catalogs, semester templates, default tags)
 * from constants/mock-data.ts into Firestore as global reference data.
 * Re-running is safe — every write uses set() with a deterministic ID.
 */
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  CS_COURSE_CATALOG,
  CS_SEMESTERS,
  DEFAULT_TAGS,
  IS_COURSE_CATALOG,
  IS_SEMESTERS,
  IT_COURSE_CATALOG,
  IT_SEMESTERS,
} from '../constants/mock-data';

const SERVICE_ACCOUNT = resolve(
  __dirname,
  '..',
  'odysseus-7cf4c-firebase-adminsdk-fbsvc-72d1a4de7c.json',
);

initializeApp({
  credential: cert(JSON.parse(readFileSync(SERVICE_ACCOUNT, 'utf8'))),
});
const db = getFirestore();

const PROGRAMS = [
  { id: 'cs', name: 'BS Computer Science', courses: CS_COURSE_CATALOG, semesters: CS_SEMESTERS },
  { id: 'is', name: 'BS Information Systems', courses: IS_COURSE_CATALOG, semesters: IS_SEMESTERS },
  { id: 'it', name: 'BS Information Technology', courses: IT_COURSE_CATALOG, semesters: IT_SEMESTERS },
] as const;

async function commitInChunks<T>(items: T[], write: (batch: FirebaseFirestore.WriteBatch, item: T) => void) {
  // Firestore batch limit is 500 writes.
  const CHUNK = 450;
  for (let i = 0; i < items.length; i += CHUNK) {
    const batch = db.batch();
    for (const item of items.slice(i, i + CHUNK)) write(batch, item);
    await batch.commit();
  }
}

async function seedTags() {
  await commitInChunks(DEFAULT_TAGS, (batch, tag) => {
    batch.set(db.collection('tags').doc(tag.id), tag);
  });
  console.log(`  ✓ ${DEFAULT_TAGS.length} default tags`);
}

async function seedProgram(p: (typeof PROGRAMS)[number]) {
  const programRef = db.collection('programs').doc(p.id);
  await programRef.set({ id: p.id, name: p.name });

  await commitInChunks(p.courses, (batch, course) => {
    batch.set(programRef.collection('courses').doc(course.id), course);
  });

  await commitInChunks(p.semesters, (batch, sem) => {
    batch.set(programRef.collection('semesters').doc(sem.id), sem);
  });

  console.log(`  ✓ ${p.name}: ${p.courses.length} courses, ${p.semesters.length} semesters`);
}

async function main() {
  console.log('Seeding Firestore...');
  await seedTags();
  for (const p of PROGRAMS) await seedProgram(p);
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
