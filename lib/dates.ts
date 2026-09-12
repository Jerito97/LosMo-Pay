const MS_DAY = 86_400_000;

function utcDateOnly(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function birthdayToUTCDate(birthday: string): Date {
  return new Date(birthday + "T00:00:00Z");
}

/** Days from `now` until the next occurrence of this birthday (0 = today). */
export function daysUntilNextBirthday(birthday: string, now: Date = new Date()): number {
  const b = birthdayToUTCDate(birthday);
  const todayUTC = utcDateOnly(now);
  let next = Date.UTC(now.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  if (next < todayUTC) {
    next = Date.UTC(now.getUTCFullYear() + 1, b.getUTCMonth(), b.getUTCDate());
  }
  return Math.round((next - todayUTC) / MS_DAY);
}

/** Age the person turns on their next birthday. */
export function ageTurning(birthday: string, now: Date = new Date()): number {
  const b = birthdayToUTCDate(birthday);
  const days = daysUntilNextBirthday(birthday, now);
  const next = new Date(utcDateOnly(now) + days * MS_DAY);
  return next.getUTCFullYear() - b.getUTCFullYear();
}

export interface CalendarCell {
  day: number | null;
  hasBirthday: boolean;
  isToday: boolean;
}

/** Calendar grid (Mon-first) for `month` (0-11) of `year`, with leading blanks. */
export function calendarCells(
  year: number,
  month: number,
  birthdayMonthDays: Array<[number, number]>,
  now: Date = new Date(),
): CalendarCell[] {
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const byDay = new Set(
    birthdayMonthDays.filter(([m]) => m === month + 1).map(([, d]) => d),
  );
  const todayUTC = utcDateOnly(now);

  const cells: CalendarCell[] = [];
  for (let i = 0; i < lead; i++) {
    cells.push({ day: null, hasBirthday: false, isToday: false });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({
      day,
      hasBirthday: byDay.has(day),
      isToday: Date.UTC(year, month, day) === todayUTC,
    });
  }
  return cells;
}
