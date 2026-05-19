"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_STATE = exports.DEFAULT_SEMESTERS = exports.DEFAULT_STUDENT_INFO = exports.COURSE_CATALOG = exports.PROGRAM_SEMESTERS = exports.PROGRAM_CATALOGS = exports.CS_SEMESTERS = exports.IT_SEMESTERS = exports.IT_COURSE_CATALOG = exports.IS_SEMESTERS = exports.IS_COURSE_CATALOG = exports.CS_COURSE_CATALOG = exports.DEFAULT_TAGS = void 0;
const theme_1 = require("./theme");
// ─── Default Tags ──────────────────────────────────────────────────────────────
exports.DEFAULT_TAGS = [
    { id: 'coreMajor', name: 'Core Major', color: theme_1.TagColors.coreMajor, isDefault: true },
    { id: 'freeElective', name: 'Free Elective', color: theme_1.TagColors.freeElective, isDefault: true },
    { id: 'profElective', name: 'Professional Elective', color: theme_1.TagColors.profElective, isDefault: true },
    { id: 'genEd', name: 'General Education', color: theme_1.TagColors.genEd, isDefault: true },
    { id: 'thesis', name: 'Thesis/Capstone', color: theme_1.TagColors.thesis, isDefault: true },
    { id: 'peNstp', name: 'PE / NSTP', color: theme_1.TagColors.peNstp, isDefault: true },
];
// ─── BS Computer Science — Course Catalog ──────────────────────────────────────
// Source: University of San Carlos BS CS Prospectus, Effective Year 2023
exports.CS_COURSE_CATALOG = [
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
// ─── BS Information Systems — IS-Specific Courses ─────────────────────────────
// Source: University of San Carlos BS IS Prospectus, Effective Year 2023
const IS_SPECIFIC_COURSES = [
    {
        id: 'IS3204', code: 'IS 3204', name: 'Accounting for IS',
        description: 'Fundamentals of accounting principles and their application in information systems.',
        credits: 3, prerequisites: ['CIS1102N'], tags: ['coreMajor'],
    },
    {
        id: 'IS3103', code: 'IS 3103', name: 'Application Development and Emerging Technologies',
        description: 'Application development using emerging technologies and modern development practices.',
        credits: 3, prerequisites: ['CIS1104', 'CIS1204'], tags: ['coreMajor'],
    },
    {
        id: 'IS4103', code: 'IS 4103', name: 'Evaluation of Business Performance',
        description: 'Methods and tools for evaluating organizational and business performance using IS.',
        credits: 3, prerequisites: ['CIS1204'], tags: ['coreMajor'],
    },
    {
        id: 'IS3101N', code: 'IS 3101N', name: 'Introduction to Information Science',
        description: 'Foundations of information science, information organization, retrieval, and dissemination.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS3102', code: 'IS 3102', name: 'Financial Management',
        description: 'Financial planning, analysis, and management concepts for IS professionals.',
        credits: 3, prerequisites: ['IS3204'], tags: ['coreMajor'],
    },
    {
        id: 'IS3106', code: 'IS 3106', name: 'IS Project Management',
        description: 'Project management methodologies, tools, and techniques for IS projects.',
        credits: 3, prerequisites: ['CIS2201'], tags: ['coreMajor'],
    },
    {
        id: 'IS4104N', code: 'IS 4104N', name: 'Fundamentals of Information Systems',
        description: 'Core concepts of information systems, their role in organizations, and strategic value.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'ISELEC', code: 'IS ELEC', name: 'IS Elective',
        description: 'Elective course from the IS specialization track.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'IS3105', code: 'IS 3105', name: 'Enterprise Architecture',
        description: 'Design and management of enterprise-level IT architectures and infrastructure.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS3107', code: 'IS 3107', name: 'Organization and Management Concepts',
        description: 'Organizational theory, management principles, and their application in IS contexts.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS3201', code: 'IS 3201', name: 'Capstone 1',
        description: 'First phase of the IS capstone: proposal, requirements gathering, and system design.',
        credits: 3, prerequisites: ['IS3103', 'IS3106'], tags: ['thesis'],
    },
    {
        id: 'IS3104', code: 'IS 3104', name: 'Collection Management of Information Resources',
        description: 'Strategies for managing, organizing, and preserving information resources.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS3205', code: 'IS 3205', name: 'Quantitative Methods',
        description: 'Statistical and quantitative techniques for decision-making in IS.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS3206', code: 'IS 3206', name: 'IS Strategy Management and Acquisition',
        description: 'Strategic planning for IS acquisition, implementation, and management.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS4101', code: 'IS 4101', name: 'Capstone 2',
        description: 'Second phase: full implementation, testing, documentation, and defense of the capstone project.',
        credits: 3, prerequisites: ['IS3201'], tags: ['thesis'],
    },
    {
        id: 'IS4102', code: 'IS 4102', name: 'Practicum A',
        description: 'Industry immersion and practical application of IS skills in a professional setting.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'ISFREELEC', code: 'IS FREE ELEC', name: 'IS Free Elective',
        description: 'Free elective course for IS students from IT or CS tracks.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'IS3203', code: 'IS 3203', name: 'Information Resources and Services',
        description: 'Management and delivery of information resources and reference services.',
        credits: 3, prerequisites: ['IS3104'], tags: ['coreMajor'],
    },
    {
        id: 'IS3207N', code: 'IS 3207N', name: 'Professional Issues',
        description: 'Ethical, legal, and professional issues in information systems practice.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS4201', code: 'IS 4201', name: 'Seminars and Tours',
        description: 'Industry seminars, company visits, and exposure to current trends in IS.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IS4202', code: 'IS 4202', name: 'Practicum B',
        description: 'Extended industry immersion building on Practicum A experience.',
        credits: 6, prerequisites: ['IS4102'], tags: ['coreMajor'],
    },
    // IS-specific versions of shared courses with different prerequisites
    {
        id: 'CIS2205', code: 'CIS 2205', name: 'Design Project',
        description: 'Collaborative design project applying systems analysis, design, and implementation skills.',
        credits: 3, prerequisites: ['CIS2103', 'CIS2102'], tags: ['coreMajor'],
    },
    {
        id: 'CIS2206N', code: 'CIS 2206N', name: 'Programming NC IV',
        description: 'Advanced programming certification-aligned course.',
        credits: 1, prerequisites: [], tags: ['coreMajor'],
    },
];
// Course IDs shared between CS and IS
const IS_SHARED_IDS = [
    'CIS1101', 'CIS1102N', 'CIS1103', 'CIS1104',
    'CIS1201', 'CIS1202', 'CIS1203', 'CIS1204', 'CIS1205',
    'CIS2101', 'CIS2102', 'CIS2103', 'CIS2104', 'CIS2105', 'CIS2106N',
    'CIS2201', 'CIS2202', 'CIS2203N', 'CIS2204',
    'EDM1', 'EDM2',
    'GEMMW', 'GEPC', 'GEUTS', 'GEETHICS', 'GELWR', 'GEART', 'GETCW', 'GERPH', 'GESTS',
    'GEFREELEC1', 'GEFREELEC2', 'GEFREELEC3',
    'NSTP1', 'NSTP2',
    'TPE1101', 'TPE1202', 'TPE2103', 'TPE2204',
];
exports.IS_COURSE_CATALOG = [
    ...exports.CS_COURSE_CATALOG.filter(c => IS_SHARED_IDS.includes(c.id)),
    ...IS_SPECIFIC_COURSES,
];
// ─── BS IS Semester Plan ──────────────────────────────────────────────────────
exports.IS_SEMESTERS = [
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
            { courseId: 'CIS1204' },
            { courseId: 'CIS1205' },
            { courseId: 'CIS2106N' },
            { courseId: 'EDM2' },
            { courseId: 'GEFREELEC1' },
            { courseId: 'IS3204' },
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
            { courseId: 'GEETHICS' },
            { courseId: 'GEFREELEC2' },
            { courseId: 'IS3103' },
            { courseId: 'IS4103' },
            { courseId: 'TPE2103' },
        ],
    },
    {
        id: 'y2s2', label: '2nd Year — 2nd Semester', shortLabel: 'Y2 S2',
        year: 2, term: 2, status: 'planned',
        courses: [
            { courseId: 'CIS2203N' },
            { courseId: 'CIS2205' },
            { courseId: 'GEFREELEC3' },
            { courseId: 'GELWR' },
            { courseId: 'IS3101N' },
            { courseId: 'IS3102' },
            { courseId: 'IS3106' },
            { courseId: 'IS4104N' },
            { courseId: 'ISELEC' },
            { courseId: 'TPE2204' },
        ],
    },
    {
        id: 'y2sum', label: '2nd Year — Summer', shortLabel: 'Y2 Sum',
        year: 2, term: 3, status: 'planned',
        courses: [
            { courseId: 'IS3105' },
            { courseId: 'IS3107' },
            { courseId: 'IS3201' },
        ],
    },
    {
        id: 'y3s1', label: '3rd Year — 1st Semester', shortLabel: 'Y3 S1',
        year: 3, term: 1, status: 'planned',
        courses: [
            { courseId: 'GEART' },
            { courseId: 'GETCW' },
            { courseId: 'IS3104' },
            { courseId: 'IS3205' },
            { courseId: 'IS3206' },
            { courseId: 'IS4101' },
            { courseId: 'IS4102' },
            { courseId: 'ISFREELEC' },
        ],
    },
    {
        id: 'y3s2', label: '3rd Year — 2nd Semester', shortLabel: 'Y3 S2',
        year: 3, term: 2, status: 'planned',
        courses: [
            { courseId: 'CIS1203' },
            { courseId: 'CIS2204' },
            { courseId: 'CIS2206N' },
            { courseId: 'GERPH' },
            { courseId: 'GESTS' },
            { courseId: 'IS3203' },
            { courseId: 'IS3207N' },
            { courseId: 'IS4201' },
            { courseId: 'IS4202' },
        ],
    },
];
// ─── BS Information Technology — IT-Specific Courses ──────────────────────────
// Source: University of San Carlos BS IT Prospectus, Effective Year 2023
const IT_SPECIFIC_COURSES = [
    {
        id: 'IT3106', code: 'IT 3106', name: 'Accounting for IT',
        description: 'Fundamentals of accounting principles and their application in information technology.',
        credits: 3, prerequisites: ['CIS1102N'], tags: ['coreMajor'],
    },
    {
        id: 'IT3101N', code: 'IT 3101N', name: 'Platform Technologies',
        description: 'Study of various computing platforms, cloud services, and deployment environments.',
        credits: 3, prerequisites: ['CIS1202'], tags: ['coreMajor'],
    },
    {
        id: 'IT3107', code: 'IT 3107', name: 'Fundamentals of Data Warehousing and Data Mining',
        description: 'Data warehousing concepts, ETL processes, and data mining techniques for decision support.',
        credits: 3, prerequisites: ['CIS2104'], tags: ['coreMajor'],
    },
    {
        id: 'IT4104', code: 'IT 4104', name: 'Linux Operating System',
        description: 'Linux system administration, shell scripting, and server management.',
        credits: 3, prerequisites: ['CIS1205'], tags: ['coreMajor'],
    },
    {
        id: 'IT3102N', code: 'IT 3102N', name: 'Probability and Statistics',
        description: 'Probability theory, statistical methods, and their applications in IT.',
        credits: 3, prerequisites: ['CIS1103'], tags: ['coreMajor'],
    },
    {
        id: 'IT3103A', code: 'IT 3103A', name: 'Systems Integration and Architecture',
        description: 'Enterprise system integration patterns, middleware, APIs, and distributed architectures.',
        credits: 3, prerequisites: ['CIS1205', 'CIS2104'], tags: ['coreMajor'],
    },
    {
        id: 'IT3202N', code: 'IT 3202N', name: 'Software Quality Assurance',
        description: 'Software testing methodologies, QA processes, and quality metrics.',
        credits: 3, prerequisites: ['CIS2101', 'CIS2104'], tags: ['coreMajor'],
    },
    {
        id: 'ITELEC', code: 'IT ELEC', name: 'IT Elective',
        description: 'Elective course from the IT specialization track.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'ITFREEEL', code: 'IT FREE EL', name: 'IT Free Elective',
        description: 'Free elective course for IT students from IS or CS tracks.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'IT3104A', code: 'IT 3104A', name: 'Information Assurance and Security',
        description: 'Cybersecurity fundamentals, cryptography, network security, and risk management.',
        credits: 3, prerequisites: ['CIS1205'], tags: ['coreMajor'],
    },
    {
        id: 'IT3201N', code: 'IT 3201N', name: 'Capstone Project I',
        description: 'First phase of the IT capstone: proposal, requirements gathering, and system design.',
        credits: 3, prerequisites: ['IT3202N', 'IT3103A'], tags: ['thesis'],
    },
    {
        id: 'IT3204N', code: 'IT 3204N', name: 'Research Methods in Computing',
        description: 'Research methodologies, academic writing, and literature review for computing research.',
        credits: 3, prerequisites: ['CIS2201'], tags: ['coreMajor'],
    },
    {
        id: 'IT3105N', code: 'IT 3105N', name: 'Application Development and Emerging Technologies',
        description: 'Application development using emerging technologies and modern development practices.',
        credits: 3, prerequisites: ['CIS2203N'], tags: ['coreMajor'],
    },
    {
        id: 'IT3203N', code: 'IT 3203N', name: 'Quantitative Methods',
        description: 'Statistical and quantitative techniques for decision-making in IT.',
        credits: 3, prerequisites: ['IT3204N'], tags: ['coreMajor'],
    },
    {
        id: 'IT3206N', code: 'IT 3206N', name: 'Integrative Programming and Technology',
        description: 'Integration of multiple programming paradigms and technologies in complex systems.',
        credits: 3, prerequisites: ['CIS2101'], tags: ['coreMajor'],
    },
    {
        id: 'IT4102N', code: 'IT 4102N', name: 'Practicum 1',
        description: 'Industry immersion and practical application of IT skills in a professional setting.',
        credits: 3, prerequisites: ['CIS2101', 'CIS2104', 'IT3101N', 'IT3103A'], tags: ['coreMajor'],
    },
    {
        id: 'IT4201', code: 'IT 4201', name: 'Systems Administration and Maintenance',
        description: 'Server administration, system maintenance, and infrastructure management.',
        credits: 3, prerequisites: ['IT3101N', 'CIS2105'], tags: ['coreMajor'],
    },
    {
        id: 'ITELEC2', code: 'IT ELEC 2', name: 'IT Elective 2',
        description: 'Second elective course from the IT specialization track.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'ITFREEEL2', code: 'IT FREE EL 2', name: 'IT Free Elective 2',
        description: 'Second free elective course for IT students from IS or CS tracks.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    {
        id: 'IT3205', code: 'IT 3205', name: 'Social and Professional Issues',
        description: 'Ethical, legal, and social issues in information technology. Professional responsibilities.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IT4101', code: 'IT 4101', name: 'Capstone Project II',
        description: 'Second phase: full implementation, testing, documentation, and defense of the capstone.',
        credits: 3, prerequisites: ['IT3203N', 'IT3201N'], tags: ['thesis'],
    },
    {
        id: 'IT4103', code: 'IT 4103', name: 'Seminars and Tours',
        description: 'Industry seminars, company visits, and exposure to current trends in IT.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'IT4202N', code: 'IT 4202N', name: 'Practicum 2',
        description: 'Extended industry immersion building on Practicum 1 experience.',
        credits: 6, prerequisites: ['IT4102N'], tags: ['coreMajor'],
    },
    {
        id: 'ITELEC3', code: 'IT ELEC 3', name: 'IT Elective 3',
        description: 'Third elective course from the IT specialization track.',
        credits: 3, prerequisites: [], tags: ['profElective'],
    },
    // IT-specific versions of shared courses with different prerequisites
    {
        id: 'CIS2204', code: 'CIS 2204', name: 'Technopreneurship',
        description: 'Entrepreneurship in technology: business planning, innovation, and startup fundamentals.',
        credits: 3, prerequisites: [], tags: ['coreMajor'],
    },
    {
        id: 'CIS2206N', code: 'CIS 2206N', name: 'Programming NC IV',
        description: 'Advanced programming certification-aligned course.',
        credits: 1, prerequisites: [], tags: ['coreMajor'],
    },
];
// Course IDs shared between CS and IT
const IT_SHARED_IDS = [
    'CIS1101', 'CIS1102N', 'CIS1103', 'CIS1104',
    'CIS1201', 'CIS1202', 'CIS1204', 'CIS1205',
    'CIS2101', 'CIS2103', 'CIS2104', 'CIS2105', 'CIS2106N',
    'CIS2201', 'CIS2202', 'CIS2203N',
    'EDM1', 'EDM2',
    'GEMMW', 'GEPC', 'GEUTS', 'GEETHICS', 'GELWR', 'GEART', 'GETCW', 'GERPH', 'GESTS',
    'GEFREELEC1', 'GEFREELEC2', 'GEFREELEC3',
    'NSTP1', 'NSTP2',
    'TPE1101', 'TPE1202', 'TPE2103', 'TPE2204',
];
exports.IT_COURSE_CATALOG = [
    ...exports.CS_COURSE_CATALOG.filter(c => IT_SHARED_IDS.includes(c.id)),
    ...IT_SPECIFIC_COURSES,
];
// ─── BS IT Semester Plan ──────────────────────────────────────────────────────
exports.IT_SEMESTERS = [
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
            { courseId: 'CIS1204' },
            { courseId: 'CIS1205' },
            { courseId: 'CIS2106N' },
            { courseId: 'EDM2' },
            { courseId: 'GEFREELEC1' },
            { courseId: 'IT3106' },
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
            { courseId: 'CIS2103' },
            { courseId: 'CIS2105' },
            { courseId: 'GEETHICS' },
            { courseId: 'GEFREELEC2' },
            { courseId: 'IT3101N' },
            { courseId: 'IT3107' },
            { courseId: 'IT4104' },
            { courseId: 'TPE2103' },
        ],
    },
    {
        id: 'y2s2', label: '2nd Year — 2nd Semester', shortLabel: 'Y2 S2',
        year: 2, term: 2, status: 'planned',
        courses: [
            { courseId: 'CIS2203N' },
            { courseId: 'GEFREELEC3' },
            { courseId: 'GELWR' },
            { courseId: 'IT3102N' },
            { courseId: 'IT3103A' },
            { courseId: 'IT3202N' },
            { courseId: 'ITELEC' },
            { courseId: 'ITFREEEL' },
            { courseId: 'TPE2204' },
        ],
    },
    {
        id: 'y2sum', label: '2nd Year — Summer', shortLabel: 'Y2 Sum',
        year: 2, term: 3, status: 'planned',
        courses: [
            { courseId: 'IT3104A' },
            { courseId: 'IT3201N' },
            { courseId: 'IT3204N' },
        ],
    },
    {
        id: 'y3s1', label: '3rd Year — 1st Semester', shortLabel: 'Y3 S1',
        year: 3, term: 1, status: 'planned',
        courses: [
            { courseId: 'GEART' },
            { courseId: 'GETCW' },
            { courseId: 'IT3105N' },
            { courseId: 'IT3203N' },
            { courseId: 'IT3206N' },
            { courseId: 'IT4102N' },
            { courseId: 'IT4201' },
            { courseId: 'ITELEC2' },
            { courseId: 'ITFREEEL2' },
        ],
    },
    {
        id: 'y3s2', label: '3rd Year — 2nd Semester', shortLabel: 'Y3 S2',
        year: 3, term: 2, status: 'planned',
        courses: [
            { courseId: 'CIS2204' },
            { courseId: 'CIS2206N' },
            { courseId: 'GERPH' },
            { courseId: 'GESTS' },
            { courseId: 'IT3205' },
            { courseId: 'IT4101' },
            { courseId: 'IT4103' },
            { courseId: 'IT4202N' },
            { courseId: 'ITELEC3' },
        ],
    },
];
// ─── BS CS Semester Plan ───────────────────────────────────────────────────────
exports.CS_SEMESTERS = [
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
// ─── Program Catalogs ────────────────────────────────────────────────────────
exports.PROGRAM_CATALOGS = {
    'BS Computer Science': exports.CS_COURSE_CATALOG,
    'BS Information Systems': exports.IS_COURSE_CATALOG,
    'BS Information Technology': exports.IT_COURSE_CATALOG,
};
exports.PROGRAM_SEMESTERS = {
    'BS Computer Science': exports.CS_SEMESTERS,
    'BS Information Systems': exports.IS_SEMESTERS,
    'BS Information Technology': exports.IT_SEMESTERS,
};
// ─── Active catalog (currently CS, will switch based on user program) ─────────
exports.COURSE_CATALOG = exports.CS_COURSE_CATALOG;
// ─── Default Student Info ───────────────────────────────────────────────────────
exports.DEFAULT_STUDENT_INFO = {
    name: 'Juan Dela Cruz',
    program: 'BS Computer Science',
    yearLevel: 1,
    studentId: '2023-00123',
};
// ─── Default Semester Plan ──────────────────────────────────────────────────────
exports.DEFAULT_SEMESTERS = exports.CS_SEMESTERS;
// ─── Initial State ──────────────────────────────────────────────────────────────
exports.INITIAL_STATE = {
    semesters: exports.DEFAULT_SEMESTERS,
    customTags: [],
    studentInfo: exports.DEFAULT_STUDENT_INFO,
};
