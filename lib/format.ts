export function money(amount: number): string {
  return "$" + Math.round(Math.abs(amount)).toLocaleString("es-AR");
}

export function signedMoney(amount: number): string {
  const prefix = amount > 0 ? "+" : amount < 0 ? "−" : "";
  return prefix + money(amount);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const MONTHS_FULL = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const MONTHS_ABBR = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export const WEEKDAYS_ABBR = ["L", "M", "M", "J", "V", "S", "D"];

export const WEEKDAYS_FULL = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado",
];

export function todayLabel(now: Date = new Date()): string {
  const weekday = WEEKDAYS_FULL[now.getDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${now.getDate()} de ${MONTHS_FULL[now.getMonth()]}`;
}

function birthdayToUTCDate(birthday: string): Date {
  return new Date(birthday + "T00:00:00Z");
}

export function formatBirthdayFull(birthday: string): string {
  const d = birthdayToUTCDate(birthday);
  return `${d.getUTCDate()} de ${MONTHS_FULL[d.getUTCMonth()]}`;
}

export function formatBirthdayShort(birthday: string): string {
  const d = birthdayToUTCDate(birthday);
  return `${d.getUTCDate()} ${MONTHS_ABBR[d.getUTCMonth()]}`;
}

export function relativeDateLabel(dateISO: string, now: Date = new Date()): string {
  const d = new Date(dateISO + "T00:00:00Z");
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diffDays = Math.round((todayUTC - dUTC) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return formatBirthdayShort(dateISO);
}
