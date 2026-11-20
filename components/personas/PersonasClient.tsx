"use client";

import Link from "next/link";
import { useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Avatar } from "@/components/ui/Avatar";
import { isZeroMoney, money } from "@/lib/format";

export interface PersonaRow {
  id: string;
  name: string;
  isMe: boolean;
  meta: string;
  net: number; // saldo entre VOS y esta persona puntual (no el global del grupo)
}

type View = "todos" | "te-deben" | "debes";

export function PersonasClient({ people }: { people: PersonaRow[] }) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("todos");

  const q = search.trim().toLowerCase();
  const matching = people.filter((p) => p.name.toLowerCase().includes(q));

  let shown: typeof matching;
  if (view === "te-deben") {
    shown = matching.filter((p) => !isZeroMoney(p.net) && p.net > 0).sort((a, b) => b.net - a.net);
  } else if (view === "debes") {
    shown = matching.filter((p) => !isZeroMoney(p.net) && p.net < 0).sort((a, b) => a.net - b.net);
  } else {
    shown = [...matching].sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  const emptyMessage =
    q.length > 0
      ? "Nadie con ese nombre."
      : view === "te-deben"
        ? "Nadie te debe nada ahora."
        : view === "debes"
          ? "No le debés nada a nadie."
          : "No hay nadie en el grupo.";

  return (
    <div>
      <div className="mt-4 flex items-center gap-2.5 rounded-full border border-line bg-card px-4">
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

      <Segmented
        className="mt-3"
        options={[
          { value: "todos", label: "Todos" },
          { value: "te-deben", label: "Te deben" },
          { value: "debes", label: "Debés" },
        ]}
        value={view}
        onChange={setView}
      />

      <div className="mt-4 flex flex-col gap-2.5">
        {shown.map((p) => {
          const state = p.net > 0 ? "te debe" : p.net < 0 ? "debés" : "al día";
          const color = p.net > 0 ? "var(--brand-ink)" : p.net < 0 ? "var(--rose)" : "var(--faint)";
          return (
            <Link
              key={p.id}
              href={`/personas/${p.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
            >
              <Avatar name={p.name} userId={p.id} size={42} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-[16.5px] font-semibold">{p.name}</span>
                  {p.isMe && (
                    <span className="rounded border border-line2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent uppercase">
                      vos
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">{p.meta}</span>
              </span>
              <span className="flex-none text-right">
                <span className="block text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
                  {state}
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold" style={{ color }}>
                  {isZeroMoney(p.net) ? "—" : money(p.net)}
                </span>
              </span>
              <span className="flex-none text-[15px] text-faint">›</span>
            </Link>
          );
        })}
        {shown.length === 0 && <div className="px-1 py-6 text-[13px] text-muted">{emptyMessage}</div>}
      </div>
    </div>
  );
}
