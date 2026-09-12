"use client";

import Link from "next/link";
import { useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Avatar } from "@/components/ui/Avatar";
import { money } from "@/lib/format";

export interface PersonaRow {
  id: string;
  name: string;
  meta: string;
  net: number; // saldo neto global de esa persona en todo el grupo
}

type Sort = "alfabetico" | "deben" | "les-deben";

export function PersonasClient({ people }: { people: PersonaRow[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("alfabetico");

  const q = search.trim().toLowerCase();
  const filtered = people.filter((p) => p.name.toLowerCase().includes(q));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "alfabetico") return a.name.localeCompare(b.name, "es");
    if (sort === "deben") return a.net - b.net; // más negativo (deben más) primero
    return b.net - a.net; // les deben más primero
  });

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
          { value: "alfabetico", label: "Alfabético" },
          { value: "deben", label: "Deben más" },
          { value: "les-deben", label: "Les deben más" },
        ]}
        value={sort}
        onChange={setSort}
      />

      <div className="mt-4 flex flex-col gap-2.5">
        {sorted.map((p) => {
          const state = p.net > 0 ? "le deben" : p.net < 0 ? "debe" : "al día";
          const color = p.net > 0 ? "var(--brand-ink)" : p.net < 0 ? "var(--rose)" : "var(--faint)";
          return (
            <Link
              key={p.id}
              href={`/personas/${p.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
            >
              <Avatar name={p.name} userId={p.id} size={42} />
              <span className="min-w-0 flex-1">
                <span className="block text-[16.5px] font-semibold">{p.name}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{p.meta}</span>
              </span>
              <span className="flex-none text-right">
                <span className="block text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
                  {state}
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold" style={{ color }}>
                  {p.net === 0 ? "—" : money(p.net)}
                </span>
              </span>
              <span className="flex-none text-[15px] text-faint">›</span>
            </Link>
          );
        })}
        {sorted.length === 0 && (
          <div className="px-1 py-6 text-[13px] text-muted">Nadie con ese nombre.</div>
        )}
      </div>
    </div>
  );
}
