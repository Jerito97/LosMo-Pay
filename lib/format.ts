import { nowInArgentina } from "./dates";

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

export function todayLabel(now: Date = nowInArgentina()): string {
  // Getters UTC a propósito: `now` ya viene desplazado a hora argentina
  // (ver nowInArgentina), así que leerlo con getters locales dependería del
  // huso horario del proceso que corre el servidor.
  const weekday = WEEKDAYS_FULL[now.getUTCDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${now.getUTCDate()} de ${MONTHS_FULL[now.getUTCMonth()]}`;
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

export function relativeDateLabel(dateISO: string, now: Date = nowInArgentina()): string {
  const d = new Date(dateISO + "T00:00:00Z");
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const diffDays = Math.round((todayUTC - dUTC) / 86_400_000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return formatBirthdayShort(dateISO);
}

/**
 * "hace N": duración real transcurrida, por eso usa relojes reales
 * (`new Date()`), nunca `nowInArgentina()` -esa función desplaza el reloj
 * para leer el día calendario correcto y arruinaría esta cuenta.
 */
export function timeAgo(date: Date, now: Date = new Date()): string {
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} día${days === 1 ? "" : "s"}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `hace ${weeks} semana${weeks === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `hace ${months} mes${months === 1 ? "" : "es"}`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years === 1 ? "" : "s"}`;
}
