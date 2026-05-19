/**
 * generate-db-json.mjs
 * Run with: node scripts/generate-db-json.mjs
 *
 * Parses mock-data.ts as plain text (no React Native imports needed)
 * and writes a db.json file.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// ── Step 1: Read source files ─────────────────────────────────────────────────
const mockDataSrc = readFileSync(resolve(root, 'constants/mock-data.ts'), 'utf-8');
const themeSrc    = readFileSync(resolve(root, 'constants/theme.ts'), 'utf-8');

// ── Step 2: Extract TagColors from theme.ts ───────────────────────────────────
// Pull out just the TagColors object via regex so we can stub it
const tagColorsMatch = themeSrc.match(/export const TagColors[^=]*=\s*(\{[\s\S]*?\n\});/);
if (!tagColorsMatch) throw new Error('Could not find TagColors in theme.ts');
const tagColorsJs = tagColorsMatch[1];

// ── Step 3: Strip TypeScript syntax from mock-data.ts ────────────────────────
let js = mockDataSrc
  // Remove import lines
  .replace(/^import\s+.*?;?\s*$/gm, '')
  // Remove type annotations on variables: `: Tag[]`, `: Course[]`, etc.
  .replace(/:\s*(Tag|Course|Semester|StudentInfo|StudentPlanState|Record<[^>]+>)[[\]]*\s*(?==)/g, '')
  // Remove `export const` -> `const` (we collect manually)
  // Keep exports so we can detect them
  .replace(/\bexport\s+(const|let|var)\b/g, 'var')
  // Remove readonly / type-only keywords
  .replace(/\breadonly\b/g, '');

// ── Step 4: Run in a sandbox with TagColors stubbed ───────────────────────────
const sandbox = { TagColors: null };

// Evaluate TagColors first
vm.runInNewContext(`TagColors = ${tagColorsJs}`, sandbox);

// Now run the mock-data JS with TagColors available
const mockSandbox = { TagColors: sandbox.TagColors };
vm.runInNewContext(js, mockSandbox);

// ── Step 5: Extract the catalogs and semesters ────────────────────────────────
const {
  DEFAULT_TAGS,
  CS_COURSE_CATALOG,
  IS_COURSE_CATALOG,
  IT_COURSE_CATALOG,
  CS_SEMESTERS,
  IS_SEMESTERS,
  IT_SEMESTERS,
} = mockSandbox;

// ── Step 6: Build and write db.json ──────────────────────────────────────────
const db = {
  tags: DEFAULT_TAGS,
  programs: [
    {
      id: 'cs',
      name: 'BS Computer Science',
      courses: CS_COURSE_CATALOG,
      semesters: CS_SEMESTERS,
    },
    {
      id: 'is',
      name: 'BS Information Systems',
      courses: IS_COURSE_CATALOG,
      semesters: IS_SEMESTERS,
    },
    {
      id: 'it',
      name: 'BS Information Technology',
      courses: IT_COURSE_CATALOG,
      semesters: IT_SEMESTERS,
    },
  ],
};

const outPath = resolve(root, 'db.json');
writeFileSync(outPath, JSON.stringify(db, null, 2), 'utf-8');
console.log(`✅  db.json written to: ${outPath}`);
console.log(`    Tags: ${DEFAULT_TAGS.length}`);
console.log(`    CS courses: ${CS_COURSE_CATALOG.length}`);
console.log(`    IS courses: ${IS_COURSE_CATALOG.length}`);
console.log(`    IT courses: ${IT_COURSE_CATALOG.length}`);
