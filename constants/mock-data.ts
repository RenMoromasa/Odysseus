import { Course, Semester, StudentInfo, StudentPlanState, Tag } from './types';

// ─── Default Tags ──────────────────────────────────────────────────────────────
export const DEFAULT_TAGS: Tag[] = [
  { id: 'coreMajor', name: 'Core Major', color: '#7C6AFF', isDefault: true },
  { id: 'freeElective', name: 'Free Elective', color: '#F472B6', isDefault: true },
  { id: 'profElective', name: 'Professional Elective', color: '#A78BFA', isDefault: true },
  { id: 'genEd', name: 'General Education', color: '#4ECDC4', isDefault: true },
  { id: 'thesis', name: 'Thesis/Capstone', color: '#FFD166', isDefault: true },
  { id: 'peNstp', name: 'PE / NSTP', color: '#94A3B8', isDefault: true },
  { id: 'religion', name: 'Religion', color: '#F59E0B', isDefault: true },
];

// ─── BS Computer Science — Course Catalog ──────────────────────────────────────
// Source: University of San Carlos BS CS Prospectus, Effective Year 2023

export const CS_COURSE_CATALOG: Course[] = [
  // ── Year 1, 1st Semester ────────────────────────────────────────────────────
  {
    id: 'CIS1101', code: 'CIS 1101', name: 'Programming I',
    description: 'Introduction to programming fundamentals using a high-level language.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CIS1102N', code: 'CIS 1102N', name: 'Introduction to Computing',
    description: 'Foundational course covering computer systems, number systems, and basic computational thinking.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CIS1103', code: 'CIS 1103', name: 'Discrete Structures I',
    description: 'Logic, sets, relations, functions, and proof techniques for computing.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CIS1104', code: 'CIS 1104', name: 'Human-Computer Interaction',
    description: 'Principles of user interface design, usability, and user experience.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'EDM1', code: 'EDM 1', name: 'The Carolinian Missionary',
    description: 'USC core religion course on the Carolinian missionary identity and values.',
    credits: 3, prerequisites: [], tags: ['religion'],
  },
  {
    id: 'GEMMW', code: 'GE-MMW', name: 'Mathematics in the Modern World',
    description: 'Applications of mathematics in everyday life, data management, and logical reasoning.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GEPC', code: 'GE-PC', name: 'Purposive Communication',
    description: 'Effective communication in various contexts using appropriate language and modalities.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GEUTS', code: 'GE-UTS', name: 'Understanding the Self',
    description: 'Exploration of identity, self-concept, and personal development in the context of society.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'NSTP1', code: 'NSTP 1', name: 'National Service Training Program 1',
    description: 'Civic welfare training service or literacy training service for community engagement.',
    credits: 3, prerequisites: [], tags: ['peNstp'],
  },
  {
    id: 'TPE1101', code: 'TPE 1101', name: 'Path-Fit 1 — Movement Enhancement',
    description: 'Foundation of physical fitness, wellness concepts, and movement enhancement activities.',
    credits: 2, prerequisites: [], tags: ['peNstp'],
  },

  // ── Year 1, 2nd Semester ────────────────────────────────────────────────────
  {
    id: 'CIS1201', code: 'CIS 1201', name: 'Programming II',
    description: 'Continuation of Programming I. Topics include file handling, advanced data structures, and modular programming.',
    credits: 3, prerequisites: ['CIS1101'], tags: ['coreMajor'],
  },
  {
    id: 'CIS1202', code: 'CIS 1202', name: 'Web Development I',
    description: 'Introduction to web development covering HTML, CSS, JavaScript, and basic server-side programming.',
    credits: 3, prerequisites: ['CIS1101', 'CIS1104'], tags: ['coreMajor'],
  },
  {
    id: 'CIS1203', code: 'CIS 1203', name: 'Discrete Structures II',
    description: 'Continuation of Discrete Structures I. Combinatorics, graph theory, and algebraic structures.',
    credits: 3, prerequisites: ['CIS1103'], tags: ['coreMajor'],
  },
  {
    id: 'CIS1204', code: 'CIS 1204', name: 'Information Management I',
    description: 'Introduction to database concepts, relational model, SQL, and data management fundamentals.',
    credits: 3, prerequisites: ['CIS1101'], tags: ['coreMajor'],
  },
  {
    id: 'CIS1205', code: 'CIS 1205', name: 'Networking I',
    description: 'Network fundamentals, OSI model, TCP/IP, and basic network configuration.',
    credits: 3, prerequisites: ['CIS1102N'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2106N', code: 'CIS 2106N', name: 'Computer Hardware Servicing NC II',
    description: 'Hands-on computer hardware assembly, troubleshooting, and maintenance.',
    credits: 1, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'EDM2', code: 'EDM 2', name: 'The Mission of Prophetic Dialogue',
    description: 'USC core religion course on the mission of prophetic dialogue in society.',
    credits: 3, prerequisites: ['EDM1'], tags: ['religion'],
  },
  {
    id: 'GEFREELEC1', code: 'GE-FREELEC 1', name: 'General Education Free Elective 1',
    description: 'Free elective from the General Education program.',
    credits: 3, prerequisites: [], tags: ['freeElective'],
  },
  {
    id: 'NSTP2', code: 'NSTP 2', name: 'National Service Training Program 2',
    description: 'Continuation of NSTP 1. Community immersion and service learning.',
    credits: 3, prerequisites: ['NSTP1'], tags: ['peNstp'],
  },
  {
    id: 'TPE1202', code: 'TPE 1202', name: 'Path-Fit II — Fitness Exercises',
    description: 'Physical fitness exercises and wellness activities.',
    credits: 2, prerequisites: ['TPE1101'], tags: ['peNstp'],
  },

  // ── Year 1, Summer ──────────────────────────────────────────────────────────
  {
    id: 'CIS2104', code: 'CIS 2104', name: 'Information Management II',
    description: 'Advanced database topics: normalization, transactions, stored procedures, and database administration.',
    credits: 3, prerequisites: ['CIS1204'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2201', code: 'CIS 2201', name: 'Systems Analysis and Design',
    description: 'System development methodologies, requirements analysis, and system design techniques.',
    credits: 3, prerequisites: ['CIS1204'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2202', code: 'CIS 2202', name: 'Digital Logic Design and Digital Computer Circuits',
    description: 'Boolean algebra, combinational and sequential circuits, and digital system design.',
    credits: 3, prerequisites: ['CIS1102N'], tags: ['coreMajor'],
  },

  // ── Year 2, 1st Semester ────────────────────────────────────────────────────
  {
    id: 'CIS2101', code: 'CIS 2101', name: 'Data Structures and Algorithms',
    description: 'Study of fundamental data structures (stacks, queues, trees, graphs) and algorithm design and analysis.',
    credits: 3, prerequisites: ['CIS1201'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2102', code: 'CIS 2102', name: 'Web Development II',
    description: 'Advanced web development: frameworks, APIs, databases integration, and deployment.',
    credits: 3, prerequisites: ['CIS1202'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2103', code: 'CIS 2103', name: 'Object-Oriented Programming',
    description: 'Principles of OOP including encapsulation, inheritance, polymorphism, and design patterns.',
    credits: 3, prerequisites: ['CIS1201'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2105', code: 'CIS 2105', name: 'Networking II',
    description: 'Advanced networking: routing protocols, switching, VLANs, and network security.',
    credits: 3, prerequisites: ['CIS1205'], tags: ['coreMajor'],
  },
  {
    id: 'CS3101N', code: 'CS 3101N', name: 'Discrete Structures III',
    description: 'Advanced discrete mathematics topics for computer science.',
    credits: 3, prerequisites: ['CIS1203'], tags: ['coreMajor'],
  },
  {
    id: 'CS3103', code: 'CS 3103', name: 'Architecture and Organization with Assembly Language',
    description: 'Computer architecture, instruction sets, and assembly language programming.',
    credits: 3, prerequisites: ['CIS2202'], tags: ['coreMajor'],
  },
  {
    id: 'GEETHICS', code: 'GE-ETHICS', name: 'Ethics',
    description: 'Foundations of ethical reasoning, moral frameworks, and applied ethics.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GEFREELEC2', code: 'GE-FREELEC 2', name: 'General Education Free Elective 2',
    description: 'Free elective from the General Education program.',
    credits: 3, prerequisites: [], tags: ['freeElective'],
  },
  {
    id: 'TPE2103', code: 'TPE 2103', name: 'Path-Fit III — Movement Education 1',
    description: 'Movement education and physical activity.',
    credits: 2, prerequisites: ['TPE1202'], tags: ['peNstp'],
  },

  // ── Year 2, 2nd Semester ────────────────────────────────────────────────────
  {
    id: 'CIS2203N', code: 'CIS 2203N', name: 'Mobile Development',
    description: 'Cross-platform mobile development using modern frameworks. UI/UX design principles for mobile.',
    credits: 3, prerequisites: ['CIS1201', 'CIS1202'], tags: ['coreMajor'],
  },
  {
    id: 'CIS2204', code: 'CIS 2204', name: 'Technopreneurship',
    description: 'Entrepreneurship in technology: business planning, innovation, and startup fundamentals.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CIS2205', code: 'CIS 2205', name: 'Design Project',
    description: 'Collaborative design project applying systems analysis, design, and implementation skills.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CIS2206N', code: 'CIS 2206N', name: 'Programming NC IV',
    description: 'Advanced programming certification-aligned course.',
    credits: 1, prerequisites: ['CIS2106N'], tags: ['coreMajor'],
  },
  {
    id: 'CS3102N', code: 'CS 3102N', name: 'Algorithms and Complexity',
    description: 'Algorithm design paradigms, complexity analysis, NP-completeness, and computability.',
    credits: 3, prerequisites: ['CIS1203', 'CIS2101'], tags: ['coreMajor'],
  },
  {
    id: 'CS3203N', code: 'CS 3203N', name: 'Data Analytics',
    description: 'Data analysis techniques, statistical methods, and data visualization for decision-making.',
    credits: 3, prerequisites: ['CS3101N'], tags: ['coreMajor'],
  },
  {
    id: 'GEFREELEC3', code: 'GE-FREELEC 3', name: 'General Education Free Elective 3',
    description: 'Free elective from the General Education program.',
    credits: 3, prerequisites: [], tags: ['freeElective'],
  },
  {
    id: 'GELWR', code: 'GE-LWR', name: 'Rizal, Life and Works',
    description: 'Study of José Rizal\'s life, writings, and contributions to Philippine nationhood.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'MAT3101', code: 'MAT 3101', name: 'Advanced Calculus and Its Applications to CS',
    description: 'Calculus concepts and their applications in computer science and algorithm analysis.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'TPE2204', code: 'TPE 2204', name: 'Path-Fit IV — Movement Education 2',
    description: 'Continuation of movement education and physical wellness.',
    credits: 2, prerequisites: ['TPE1202'], tags: ['peNstp'],
  },

  // ── Year 2, Summer ──────────────────────────────────────────────────────────
  {
    id: 'CS3105N', code: 'CS 3105N', name: 'Application Development and Emerging Technologies',
    description: 'Application development using emerging technologies and modern development practices.',
    credits: 3, prerequisites: ['CIS2201', 'CIS2104'], tags: ['coreMajor'],
  },
  {
    id: 'CS3201N', code: 'CS 3201N', name: 'CS Thesis 1',
    description: 'First phase of the CS thesis: proposal writing, literature review, and research design.',
    credits: 3, prerequisites: [], tags: ['thesis'],
  },
  {
    id: 'CS3206', code: 'CS 3206', name: 'Social Issues and Professional Practices',
    description: 'Ethical, legal, and social issues in computing. Professional responsibilities and practices.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },

  // ── Year 3, 1st Semester ────────────────────────────────────────────────────
  {
    id: 'CS3104N', code: 'CS 3104N', name: 'Operating Systems',
    description: 'Process management, memory management, file systems, and OS security concepts.',
    credits: 3, prerequisites: ['CIS2101'], tags: ['coreMajor'],
  },
  {
    id: 'CS3106N', code: 'CS 3106N', name: 'Information Assurance and Security',
    description: 'Cybersecurity fundamentals, cryptography, network security, and ethical hacking.',
    credits: 3, prerequisites: ['CIS2105'], tags: ['coreMajor'],
  },
  {
    id: 'CS3202N', code: 'CS 3202N', name: 'Automata Theory and Formal Languages',
    description: 'Finite automata, regular expressions, context-free grammars, and Turing machines.',
    credits: 3, prerequisites: ['CS3102N'], tags: ['coreMajor'],
  },
  {
    id: 'CS3205', code: 'CS 3205', name: 'Software Engineering',
    description: 'Software development lifecycle, requirements engineering, design methodologies, testing, and project management.',
    credits: 3, prerequisites: ['CIS2201'], tags: ['coreMajor'],
  },
  {
    id: 'CS4101N', code: 'CS 4101N', name: 'CS Thesis 2',
    description: 'Second phase of the CS thesis: implementation, testing, documentation, and defense.',
    credits: 3, prerequisites: ['CS3201N'], tags: ['thesis'],
  },
  {
    id: 'GEART', code: 'GE-ART', name: 'Art Appreciation',
    description: 'Study of visual arts, music, literature, and performing arts across cultures and eras.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GETCW', code: 'GE-TCW', name: 'Contemporary World',
    description: 'Analysis of contemporary global issues, globalization, and international relations.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'MAT4201', code: 'MAT 4201', name: 'Math Elective',
    description: 'Elective mathematics course for computer science students.',
    credits: 3, prerequisites: [], tags: ['profElective'],
  },

  // ── Year 3, 2nd Semester ────────────────────────────────────────────────────
  {
    id: 'CS3204N', code: 'CS 3204N', name: 'Programming Languages',
    description: 'Comparative study of programming language paradigms, syntax, semantics, and implementation.',
    credits: 3, prerequisites: ['CIS2101', 'CIS2103'], tags: ['coreMajor'],
  },
  {
    id: 'CS4102N', code: 'CS 4102N', name: 'Practicum',
    description: 'Industry immersion and practical application of computing skills in a professional setting.',
    credits: 3, prerequisites: ['CS3205', 'CS3204N', 'CS3206'], tags: ['coreMajor'],
  },
  {
    id: 'CS4103', code: 'CS 4103', name: 'Intelligent Systems',
    description: 'Artificial intelligence concepts: search, knowledge representation, machine learning, and neural networks.',
    credits: 3, prerequisites: ['CIS2101', 'CS3203N'], tags: ['coreMajor'],
  },
  {
    id: 'CS4201N', code: 'CS 4201N', name: 'Seminars and Tours',
    description: 'Industry seminars, company visits, and exposure to current trends in computing.',
    credits: 3, prerequisites: [], tags: ['coreMajor'],
  },
  {
    id: 'CSELEC', code: 'CS ELEC', name: 'CS Elective',
    description: 'Elective course from the CS specialization track.',
    credits: 3, prerequisites: [], tags: ['profElective'],
  },
  {
    id: 'CSFREEL', code: 'CS FREE EL', name: 'CS Free Elective',
    description: 'Free elective course for CS students.',
    credits: 3, prerequisites: [], tags: ['profElective'],
  },
  {
    id: 'GERPH', code: 'GE-RPH', name: 'Readings in Philippine History',
    description: 'Critical analysis of primary sources in Philippine history from pre-colonial to contemporary times.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
  {
    id: 'GESTS', code: 'GE-STS', name: 'Science, Technology and Society',
    description: 'Interrelationship of science, technology, and society in historical and contemporary contexts.',
    credits: 3, prerequisites: [], tags: ['genEd'],
  },
];

// ─── BS CS Semester Plan ───────────────────────────────────────────────────────
export const CS_SEMESTERS: Semester[] = [
  {
    id: 'y1s1', label: '1st Year — 1st Semester', shortLabel: 'Y1 S1',
    year: 1, term: 1, status: 'planned',
    courses: [
      { courseId: 'CIS1101' },
      { courseId: 'CIS1102N' },
      { courseId: 'CIS1103' },
      { courseId: 'CIS1104' },
      { courseId: 'EDM1' },
      { courseId: 'GEMMW' },
      { courseId: 'GEPC' },
      { courseId: 'GEUTS' },
      { courseId: 'NSTP1' },
      { courseId: 'TPE1101' },
    ],
  },
  {
    id: 'y1s2', label: '1st Year — 2nd Semester', shortLabel: 'Y1 S2',
    year: 1, term: 2, status: 'planned',
    courses: [
      { courseId: 'CIS1201' },
      { courseId: 'CIS1202' },
      { courseId: 'CIS1203' },
      { courseId: 'CIS1204' },
      { courseId: 'CIS1205' },
      { courseId: 'CIS2106N' },
      { courseId: 'EDM2' },
      { courseId: 'GEFREELEC1' },
      { courseId: 'NSTP2' },
      { courseId: 'TPE1202' },
    ],
  },
  {
    id: 'y1sum', label: '1st Year — Summer', shortLabel: 'Y1 Sum',
    year: 1, term: 3, status: 'planned',
    courses: [
      { courseId: 'CIS2104' },
      { courseId: 'CIS2201' },
      { courseId: 'CIS2202' },
    ],
  },
  {
    id: 'y2s1', label: '2nd Year — 1st Semester', shortLabel: 'Y2 S1',
    year: 2, term: 1, status: 'planned',
    courses: [
      { courseId: 'CIS2101' },
      { courseId: 'CIS2102' },
      { courseId: 'CIS2103' },
      { courseId: 'CIS2105' },
      { courseId: 'CS3101N' },
      { courseId: 'CS3103' },
      { courseId: 'GEETHICS' },
      { courseId: 'GEFREELEC2' },
      { courseId: 'TPE2103' },
    ],
  },
  {
    id: 'y2s2', label: '2nd Year — 2nd Semester', shortLabel: 'Y2 S2',
    year: 2, term: 2, status: 'planned',
    courses: [
      { courseId: 'CIS2203N' },
      { courseId: 'CIS2204' },
      { courseId: 'CIS2205' },
      { courseId: 'CIS2206N' },
      { courseId: 'CS3102N' },
      { courseId: 'CS3203N' },
      { courseId: 'GEFREELEC3' },
      { courseId: 'GELWR' },
      { courseId: 'MAT3101' },
      { courseId: 'TPE2204' },
    ],
  },
  {
    id: 'y2sum', label: '2nd Year — Summer', shortLabel: 'Y2 Sum',
    year: 2, term: 3, status: 'planned',
    courses: [
      { courseId: 'CS3105N' },
      { courseId: 'CS3201N' },
      { courseId: 'CS3206' },
    ],
  },
  {
    id: 'y3s1', label: '3rd Year — 1st Semester', shortLabel: 'Y3 S1',
    year: 3, term: 1, status: 'planned',
    courses: [
      { courseId: 'CS3104N' },
      { courseId: 'CS3106N' },
      { courseId: 'CS3202N' },
      { courseId: 'CS3205' },
      { courseId: 'CS4101N' },
      { courseId: 'GEART' },
      { courseId: 'GETCW' },
      { courseId: 'MAT4201' },
    ],
  },
  {
    id: 'y3s2', label: '3rd Year — 2nd Semester', shortLabel: 'Y3 S2',
    year: 3, term: 2, status: 'planned',
    courses: [
      { courseId: 'CS3204N' },
      { courseId: 'CS4102N' },
      { courseId: 'CS4103' },
      { courseId: 'CS4201N' },
      { courseId: 'CSELEC' },
      { courseId: 'CSFREEL' },
      { courseId: 'GERPH' },
      { courseId: 'GESTS' },
    ],
  },
];

// ─── Program Catalogs (add IT and IS here later) ──────────────────────────────
export const PROGRAM_CATALOGS: Record<string, Course[]> = {
  'BS Computer Science': CS_COURSE_CATALOG,
  // 'BS Information Technology': IT_COURSE_CATALOG,
  // 'BS Information Systems': IS_COURSE_CATALOG,
};

export const PROGRAM_SEMESTERS: Record<string, Semester[]> = {
  'BS Computer Science': CS_SEMESTERS,
  // 'BS Information Technology': IT_SEMESTERS,
  // 'BS Information Systems': IS_SEMESTERS,
};

// ─── Active catalog (currently CS, will switch based on user program) ─────────
export const COURSE_CATALOG: Course[] = CS_COURSE_CATALOG;

// ─── Default Student Info ───────────────────────────────────────────────────────
export const DEFAULT_STUDENT_INFO: StudentInfo = {
  name: 'Juan Dela Cruz',
  program: 'BS Computer Science',
  yearLevel: 1,
  studentId: '2023-00123',
};

// ─── Default Semester Plan ──────────────────────────────────────────────────────
export const DEFAULT_SEMESTERS: Semester[] = CS_SEMESTERS;

// ─── Initial State ──────────────────────────────────────────────────────────────
export const INITIAL_STATE: StudentPlanState = {
  semesters: DEFAULT_SEMESTERS,
  customTags: [],
  studentInfo: DEFAULT_STUDENT_INFO,
};
