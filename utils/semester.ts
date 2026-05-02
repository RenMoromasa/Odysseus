export type SemesterTerm = 'first' | 'second' | 'summer';

export interface CurrentSemesterInfo {
  term: SemesterTerm;
  month: number;
  year: number;
}

export function getCurrentSemester(): CurrentSemesterInfo {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();
  const year = now.getFullYear();

  let term: SemesterTerm;

  // June - Aug (1st week, up to ~7th) = Summer
  if (month === 6 || month === 7 || (month === 8 && day <= 7)) {
    term = 'summer';
  }
  // Aug (last week, ~22nd+) - Dec = 1st semester
  else if ((month === 8 && day >= 22) || (month >= 9 && month <= 12)) {
    term = 'first';
  }
  // Jan - May = 2nd semester
  else {
    term = 'second';
  }

  return { term, month, year };
}

export function isSemesterMatching(semesterTerm: number, currentTerm: SemesterTerm): boolean {
  if (currentTerm === 'summer') return semesterTerm === 3;
  if (currentTerm === 'first') return semesterTerm === 1;
  if (currentTerm === 'second') return semesterTerm === 2;
  return false;
}
