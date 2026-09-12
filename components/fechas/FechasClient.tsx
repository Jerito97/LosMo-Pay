"use client";

import { useMemo, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Avatar } from "@/components/ui/Avatar";
import { calendarCells } from "@/lib/dates";
import { MONTHS_FULL, WEEKDAYS_ABBR } from "@/lib/format";

export interface FechaPerson {
  id: string;
  name: string;
  isMe: boolean;
  days: number;
  dateShort: string;
  ageLabel: string;
  month: number; // 1-12
  day: number;
}

const GROUPS: Array<{ label: string; test: (days: number) => boolean }> = [
  { label: "Esta semana", test: (d) => d <= 7 },
  { label: "Este mes", test: (d) => d > 7 && d <= 31 },
  { label: "Más adelante", test: (d) => d > 31 },
];

export function FechasClient({ people }: { people: FechaPerson[] }) {
  const [view, setView] = useState<"lista" | "calendario">("lista");
  const [search, setSearch] = useState("");
  const now = useMemo(() => new Date(), []);
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const groups = GROUPS.map((g) => ({
    label: g.label,
    items: filtered.filter((p) => g.test(p.days)),
  })).filter((g) => g.items.length > 0);

  const cells = calendarCells(
    calYear,
    calMonth,
    people.map((p) => [p.month, p.day]),
    now,
  );
  const monthPeople = people.filter((p) => p.month === calMonth + 1);

  function shiftMonth(delta: number) {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCalMonth(m);
    setCalYear(y);
  }

  return (
    <div className="px-[18px] pt-14 pb-[100px] [animation:sIn_.26s_ease-out]">
      <h1 className="mx-1 font-[family-name:var(--font-display)] text-[40px] leading-none font-normal">
        Fechas
      </h1>

      <Segmented
        className="mt-4"
        options={[
          { value: "lista", label: "Lista" },
          { value: "calendario", label: "Calendario" },
        ]}
        value={view}
        onChange={setView}
      />

      {view === "lista" && (
        <div>
          <div className="mt-3.5 flex items-center gap-2.5 rounded-full border border-line bg-card px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar persona"
              className="min-w-0 flex-1 bg-transparent py-3.5 text-[14.5px] font-medium text-ink outline-none"
            />
          </div>

          {groups.map((group) => (
            <div key={group.label}>
              <div className="mt-5 flex items-center gap-2.5 px-1">
                <span className="text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
                  {group.label}
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="text-[11px] font-semibold text-faint">
                  {group.items.length} {group.items.length === 1 ? "fecha" : "fechas"}
                </span>
              </div>
              <div className="mt-2.5 flex flex-col gap-2.5">
                {group.items.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
                  >
                    <Avatar name={p.name} userId={p.id} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="text-[16px] font-semibold">{p.name}</span>
                        <span className="rounded border border-line2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                          {p.isMe ? "vos" : "cumple"}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[12px] text-muted">
                        {p.dateShort} · {p.ageLabel}
                      </span>
                    </span>
                    <span className="flex-none text-right">
                      <span
                        className="block text-[20px] font-semibold leading-none"
                        style={{ color: p.days === 0 ? "var(--rose)" : "var(--brand-ink)" }}
                      >
                        {p.days === 0 ? "hoy" : p.days}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-faint uppercase">
                        {p.days === 0 ? "es el día" : "días"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === "calendario" && (
        <div>
          <div className="mt-3.5 rounded-2xl border border-line bg-card p-4 shadow-[0_2px_8px_rgba(43,16,21,0.04)]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-line text-[14px] text-brand-ink"
              >
                ←
              </button>
              <span className="font-[family-name:var(--font-display)] text-[22px]">
                {MONTHS_FULL[calMonth].charAt(0).toUpperCase() + MONTHS_FULL[calMonth].slice(1)}{" "}
                {calYear}
              </span>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full border border-line text-[14px] text-brand-ink"
              >
                →
              </button>
            </div>
            <div className="mt-3.5 grid grid-cols-7 gap-1">
              {WEEKDAYS_ABBR.map((w, i) => (
                <div key={i} className="pb-1 text-center text-[10px] font-bold tracking-wide text-faint">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => (
                <div
                  key={i}
                  className="flex aspect-square flex-col items-center justify-center gap-[3px] rounded-[9px] border"
                  style={{
                    borderColor: cell.day === null ? "transparent" : cell.isToday ? "var(--wine)" : cell.hasBirthday ? "var(--rose2)" : "var(--line)",
                    background: cell.day === null ? "transparent" : cell.isToday ? "var(--wine)" : cell.hasBirthday ? "var(--card)" : "transparent",
                  }}
                >
                  {cell.day !== null && (
                    <>
                      <span
                        className="text-[12px]"
                        style={{
                          color: cell.isToday ? "var(--onwine)" : cell.hasBirthday ? "var(--ink)" : "var(--faint)",
                          fontWeight: cell.hasBirthday || cell.isToday ? 700 : 400,
                        }}
                      >
                        {cell.day}
                      </span>
                      <span
                        className="h-[5px] w-[5px] rounded-full"
                        style={{
                          background: cell.isToday ? "var(--onwine)" : cell.hasBirthday ? "var(--rose2)" : "transparent",
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5.5 px-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
            En {MONTHS_FULL[calMonth]}
          </div>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {monthPeople.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
              >
                <Avatar name={p.name} userId={p.id} size={34} />
                <span className="flex-1 text-[15px] font-semibold">{p.name}</span>
                <span className="text-[12px] text-muted">
                  {p.dateShort} · {p.ageLabel}
                </span>
              </div>
            ))}
            {monthPeople.length === 0 && (
              <div className="px-1 py-5 text-[13px] text-muted">Ninguna fecha este mes.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
