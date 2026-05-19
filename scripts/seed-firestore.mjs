/**
 * seed-firestore.mjs
 * Run ONCE to populate Firestore with your course catalog.
 *
 * Usage:
 *   1. Download your Firebase service account key (see README below)
 *   2. Place it at: scripts/serviceAccountKey.json
 *   3. Run: node scripts/seed-firestore.mjs
 *
 * Firestore structure created:
 *   /tags/{tagId}                          → Tag documents
 *   /programs/{programId}                  → Program metadata
 *   /programs/{programId}/courses/{courseId} → Course sub-collection
 *   /programs/{programId}/semesters/{semId}  → Semester sub-collection
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const require = createRequire(import.meta.url);

// ── Load Firebase Admin SDK ───────────────────────────────────────────────────
// Uses CommonJS require since firebase-admin is CJS
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

// ── Load db.json ──────────────────────────────────────────────────────────────
const db = JSON.parse(readFileSync(resolve(root, 'db.json'), 'utf-8'));

// ── Helper: batch write with auto-flush every 500 ops ────────────────────────
async function batchSet(entries) {
  const BATCH_LIMIT = 500;
  let batch = firestore.batch();
  let count = 0;

  for (const { ref, data } of entries) {
    batch.set(ref, data);
    count++;

    if (count === BATCH_LIMIT) {
      await batch.commit();
      console.log(`  ✔ Flushed ${count} writes`);
      batch = firestore.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`  ✔ Flushed ${count} writes`);
  }
}

// ── Seed Tags ─────────────────────────────────────────────────────────────────
async function seedTags() {
  console.log('\n📌 Seeding tags...');
  const entries = db.tags.map(tag => ({
    ref: firestore.collection('tags').doc(tag.id),
    data: tag,
  }));
  await batchSet(entries);
  console.log(`✅ ${entries.length} tags seeded.`);
}

// ── Seed Programs, Courses, and Semesters ─────────────────────────────────────
async function seedPrograms() {
  for (const program of db.programs) {
    console.log(`\n📚 Seeding program: ${program.name}`);

    // Write program document
    await firestore.collection('programs').doc(program.id).set({
      id: program.id,
      name: program.name,
    });

    // Write courses as sub-collection
    console.log(`  → Seeding ${program.courses.length} courses...`);
    const courseEntries = program.courses.map(course => ({
      ref: firestore.collection('programs').doc(program.id).collection('courses').doc(course.id),
      data: course,
    }));
    await batchSet(courseEntries);

    // Write semesters as sub-collection
    console.log(`  → Seeding ${program.semesters.length} semesters...`);
    const semesterEntries = program.semesters.map(sem => ({
      ref: firestore.collection('programs').doc(program.id).collection('semesters').doc(sem.id),
      data: sem,
    }));
    await batchSet(semesterEntries);

    console.log(`✅ ${program.name} seeded.`);
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
(async () => {
  try {
    console.log('🚀 Starting Firestore seed...');
    await seedTags();
    await seedPrograms();
    console.log('\n🎉 All done! Firestore is now seeded.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
})();
