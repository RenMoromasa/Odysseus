import { Course, Tag, Semester, StudentInfo, StudentPlanState } from './types';

// ─── Default Tags ──────────────────────────────────────────────────────────────
export const DEFAULT_TAGS: Tag[] = [
  { id: 'coreMajor', name: 'Core Major', color: '#7C6AFF', isDefault: true },
  { id: 'freeElective', name: 'Free Elective', color: '#F472B6', isDefault: true },
  { id: 'minor', name: 'Minor', color: '#38BDF8', isDefault: true },
  { id: 'profElective', name: 'Professional Elective', color: '#A78BFA', isDefault: true },
  { id: 'genEd', name: 'General Education', color: '#4ECDC4', isDefault: true },
  { id: 'thesis', name: 'Thesis/Capstone', color: '#FFD166', isDefault: true },
  { id: 'peNstp', name: 'PE / NSTP', color: '#94A3B8', isDefault: true },
];

// ─── Course Catalog ─────────────────────────────────────────────────────────────
export const COURSE_CATALOG: Course[] = [
  {
    id: 'CC101', code: 'CC 101', name: 'Introduction to Computing',
    description: 'Foundational course covering computer systems, number systems, and basic computational thinking.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CC102', code: 'CC 102', name: 'Computer Programming 1',
    description: 'Introduction to programming using a high-level language. Covers variables, control structures, functions, and arrays.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CC103', code: 'CC 103', name: 'Computer Programming 2',
    description: 'Continuation of Programming 1. Topics include file handling, advanced data structures, and modular programming.',
    credits: 3, prerequisites: ['CC102'], tags: ['coreMajor'],
  },
  {
    id: 'CC104', code: 'CC 104', name: 'Data Structures & Algorithms',
    description: 'Study of fundamental data structures (stacks, queues, trees, graphs) and algorithm design and analysis.',
    credits: 3, prerequisites: ['CC103'], tags: ['coreMajor'],
  },
  {
    id: 'CC105', code: 'CC 105', name: 'Object-Oriented Programming',
    description: 'Principles of OOP including encapsulation, inheritance, polymorphism, and design patterns.',
    credits: 3, prerequisites: ['CC103'], tags: ['coreMajor'],
  },
  {
    id: 'CC106', code: 'CC 106', name: 'Database Management Systems',
    description: 'Relational database design, SQL, normalization, transactions, and database administration fundamentals.',
    credits: 3, prerequisites: ['CC104'], tags: ['coreMajor'],
  },
  {
    id: 'CC107', code: 'CC 107', name: 'Web Development',
    description: 'Full-stack web development covering HTML, CSS, JavaScript, and server-side programming.',
    credits: 3, prerequisites: ['CC103'], tags: ['coreMajor'],
  },
  {
    id: 'CC108', code: 'CC 108', name: 'Operating Systems',
    description: 'Process management, memory management, file systems, and OS security concepts.',
    credits: 3, prerequisites: ['CC104'], tags: ['coreMajor'],
  },
  {
    id: 'CC109', code: 'CC 109', name: 'Software Engineering',
    description: 'Software development lifecycle, requirements engineering, design methodologies, testing, and project management.',
    credits: 3, prerequisites: ['CC105', 'CC106'], tags: ['coreMajor'],
  },
  {
    id: 'CC110', code: 'CC 110', name: 'Networks & Communications',
    description: 'Network architectures, protocols (TCP/IP), routing, switching, and wireless networking.',
    credits: 3, prerequisites: ['CC108'], tags: ['coreMajor'],
  },
  {
    id: 'CC111', code: 'CC 111', name: 'Systems Integration & Architecture',
    description: 'Enterprise system integration patterns, middleware, APIs, microservices, and distributed architectures.',
    credits: 3, prerequisites: ['CC109', 'CC110'], tags: ['coreMajor'],
  },
  {
    id: 'CC112', code: 'CC 112', name: 'Advanced Software Engineering',
    description: 'Advanced topics in software architecture, DevOps, CI/CD pipelines, and agile methodologies.',
    credits: 3, prerequisites: ['CC109'], tags: ['coreMajor'],
  },
  {
    id: 'CC113', code: 'CC 113', name: 'Mobile App Development',
    description: 'Cross-platform mobile development using modern frameworks. UI/UX design principles for mobile.',
    credits: 3, prerequisites: ['CC107', 'CC105'], tags: ['profElective'],
  },
  {
    id: 'CC114', code: 'CC 114', name: 'Information Assurance & Security',
    description: 'Cybersecurity fundamentals, cryptography, network security, and ethical hacking.',
    credits: 3, prerequisites: ['CC110'], tags: ['profElective'],
  },
  {
    id: 'CC115', code: 'CC 115', name: 'Capstone Project 1',
    description: 'First phase of the capstone project: proposal writing, requirements gathering, and system design.',
    credits: 3, prerequisites: ['CC109'], tags: ['thesis'],
  },
  {
    id: 'CC116', code: 'CC 116', name: 'Capstone Project 2',
    description: 'Second phase: full implementation, testing, documentation, and defense of the capstone project.',
    credits: 3, prerequisites: ['CC115'], tags: ['thesis'],
  },
  {
    id: 'GE101', code: 'GE 101', name: 'Understanding the Self',
    description: 'Exploration of identity, self-concept, and personal development in the context of society.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GE102', code: 'GE 102', name: 'Mathematics in the Modern World',
    description: 'Applications of mathematics in everyday life, data management, and logical reasoning.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GE103', code: 'GE 103', name: 'Readings in Philippine History',
    description: 'Critical analysis of primary sources in Philippine history from pre-colonial to contemporary times.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'MATH101', code: 'MATH 101', name: 'Discrete Mathematics',
    description: 'Logic, sets, relations, functions, combinatorics, graph theory, and proof techniques.',
    credits: 3, prerequisites: ['GE102'], tags: ['coreMajor'],
  },
  {
    id: 'FE101', code: 'FE 101', name: 'Art Appreciation',
    description: 'Study of visual arts, music, literature, and performing arts across cultures and eras.',
    credits: 3, prerequisites: [], tags: ['freeElective'],
  },
  {
    id: 'PE101', code: 'PE 101', name: 'Physical Education 1',
    description: 'Foundation of physical fitness, wellness concepts, and recreational activities.',
    credits: 2, prerequisites: [], tags: ['peNstp'],
  },
  {
    id: 'NSTP101', code: 'NSTP 101', name: 'National Service Training 1',
    description: 'Civic welfare training service or literacy training service for community engagement.',
    credits: 3, prerequisites: [], tags: ['peNstp'],
  },
];

// ─── Default Student Info ───────────────────────────────────────────────────────
export const DEFAULT_STUDENT_INFO: StudentInfo = {
  name: 'Juan Dela Cruz',
  program: 'BS Computer Science',
  yearLevel: 3,
  studentId: '2023-00123',
};

// ─── Default Semester Plan ──────────────────────────────────────────────────────
export const DEFAULT_SEMESTERS: Semester[] = [
  {
    id: 'y1s1', label: '1st Year — 1st Semester', shortLabel: 'Y1 S1',
    year: 1, term: 1, status: 'completed',
    courses: [
      { courseId: 'CC101', grade: 'A' },
      { courseId: 'CC102', grade: 'B+' },
      { courseId: 'GE101', grade: 'A-' },
      { courseId: 'GE102', grade: 'B' },
      { courseId: 'PE101', grade: 'A' },
      { courseId: 'NSTP101', grade: 'B+' },
    ],
  },
  {
    id: 'y1s2', label: '1st Year — 2nd Semester', shortLabel: 'Y1 S2',
    year: 1, term: 2, status: 'completed',
    courses: [
      { courseId: 'CC103', grade: 'B+' },
      { courseId: 'GE103', grade: 'A' },
      { courseId: 'MATH101', grade: 'B' },
      { courseId: 'FE101', grade: 'A-' },
    ],
  },
  {
    id: 'y2s1', label: '2nd Year — 1st Semester', shortLabel: 'Y2 S1',
    year: 2, term: 1, status: 'completed',
    courses: [
      { courseId: 'CC104', grade: 'B+' },
      { courseId: 'CC105', grade: 'A-' },
    ],
  },
  {
    id: 'y2s2', label: '2nd Year — 2nd Semester', shortLabel: 'Y2 S2',
    year: 2, term: 2, status: 'completed',
    courses: [
      { courseId: 'CC106', grade: 'B' },
      { courseId: 'CC107', grade: 'A' },
    ],
  },
  {
    id: 'y3s1', label: '3rd Year — 1st Semester', shortLabel: 'Y3 S1',
    year: 3, term: 1, status: 'in-progress',
    courses: [
      { courseId: 'CC108' },
      { courseId: 'CC109' },
    ],
  },
  {
    id: 'y3s2', label: '3rd Year — 2nd Semester', shortLabel: 'Y3 S2',
    year: 3, term: 2, status: 'planned',
    courses: [
      { courseId: 'CC110' },
      { courseId: 'CC113' },
    ],
  },
  {
    id: 'y4s1', label: '4th Year — 1st Semester', shortLabel: 'Y4 S1',
    year: 4, term: 1, status: 'planned',
    courses: [
      { courseId: 'CC111' },
      { courseId: 'CC112' },
      { courseId: 'CC115' },
    ],
  },
  {
    id: 'y4s2', label: '4th Year — 2nd Semester', shortLabel: 'Y4 S2',
    year: 4, term: 2, status: 'planned',
    courses: [
      { courseId: 'CC114' },
      { courseId: 'CC116' },
    ],
  },
];

// ─── Initial State ──────────────────────────────────────────────────────────────
export const INITIAL_STATE: StudentPlanState = {
  semesters: DEFAULT_SEMESTERS,
  customTags: [],
  studentInfo: DEFAULT_STUDENT_INFO,
};
