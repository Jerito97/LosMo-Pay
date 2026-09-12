const MS_DAY = 86_400_000;
const ARGENTINA_OFFSET_MS = 3 * 60 * 60 * 1000; // UTC-3, sin horario de verano

/**
 * "Ahora" en hora argentina, como un Date cuyos getters UTC (getUTCFullYear,
 * getUTCMonth, getUTCDate, ...) devuelven directamente el año/mes/día/hora
 * de Buenos Aires. El servidor (Vercel) corre en UTC; sin esto, "hoy" y los
 * cumpleaños se calculaban con la fecha de Londres, no la de Argentina.
 */
export function nowInArgentina(): Date {
  return new Date(Date.now() - ARGENTINA_OFFSET_MS);
}

/** Fecha de hoy en Argentina, como "YYYY-MM-DD" (para guardar en columnas `date`). */
export function todayDateStringArgentina(): string {
  const now = nowInArgentina();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function utcDateOnly(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function birthdayToUTCDate(birthday: string): Date {
  return new Date(birthday + "T00:00:00Z");
}

/** Days from `now` until the next occurrence of this birthday (0 = today). */
export function daysUntilNextBirthday(birthday: string, now: Date = nowInArgentina()): number {
  const b = birthdayToUTCDate(birthday);
  const todayUTC = utcDateOnly(now);
  let next = Date.UTC(now.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  if (next < todayUTC) {
    next = Date.UTC(now.getUTCFullYear() + 1, b.getUTCMonth(), b.getUTCDate());
  }
  return Math.round((next - todayUTC) / MS_DAY);
}

/** Age the person turns on their next birthday. */
export function ageTurning(birthday: string, now: Date = nowInArgentina()): number {
  const b = birthdayToUTCDate(birthday);
  const days = daysUntilNextBirthday(birthday, now);
  const next = new Date(utcDateOnly(now) + days * MS_DAY);
  return next.getUTCFullYear() - b.getUTCFullYear();
}

/** Lunes de esta semana en Argentina: como "YYYY-MM-DD" y como instante UTC real. */
export function startOfWeekArgentina(now: Date = nowInArgentina()): {
  dateString: string;
  instant: Date;
} {
  const dayIndex = now.getUTCDay(); // 0 domingo .. 6 sábado
  const daysSinceMonday = (dayIndex + 6) % 7;
  const mondayUTC = utcDateOnly(now) - daysSinceMonday * MS_DAY;
  const monday = new Date(mondayUTC);
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(monday.getUTCDate()).padStart(2, "0");
  return {
    dateString: `${y}-${m}-${d}`,
    // mondayUTC está calculado sobre el reloj ya desplazado de
    // nowInArgentina(); sumarle de nuevo el offset lo vuelve a convertir en
    // el instante UTC real de esa medianoche en Argentina.
    instant: new Date(mondayUTC + ARGENTINA_OFFSET_MS),
  };
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
  now: Date = nowInArgentina(),
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
