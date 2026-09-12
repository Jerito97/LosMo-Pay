"use client";

import Link from "next/link";
import { useState } from "react";
import { Segmented } from "@/components/ui/Segmented";

export interface FeedPerson {
  id: string;
  name: string;
  days: number;
  dateShort: string;
  ageLabel: string;
}

type Range = "semana" | "mes" | "todo";

export function InicioFeed({ people }: { people: FeedPerson[] }) {
  const [range, setRange] = useState<Range>("mes");
  const max = range === "semana" ? 7 : range === "mes" ? 31 : Infinity;
  const filtered = people.filter((p) => p.days <= max);

  return (
    <div>
      <div className="mt-6.5 flex items-center justify-between gap-2.5 px-1">
        <span className="font-[family-name:var(--font-display)] text-[23px]">Se viene</span>
        <Segmented
          fullWidth={false}
          options={[
            { value: "semana", label: "7 días" },
            { value: "mes", label: "Mes" },
            { value: "todo", label: "Todo" },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2.5">
        {filtered.map((p) => (
          <Link
            key={p.id}
            href="/fechas"
            className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
          >
            <span className="w-11 flex-none text-center">
              <span className="block text-[22px] font-semibold leading-none text-brand-ink">
                {p.days}
              </span>
              <span className="mt-0.5 block text-[10px] font-bold tracking-wide text-faint uppercase">
                días
              </span>
            </span>
            <span className="w-px flex-none self-stretch bg-line" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5">
                <span className="text-[16px] font-semibold tracking-tight">{p.name}</span>
              </span>
              <span className="mt-0.5 block text-[12px] text-muted">
                {p.dateShort} · {p.ageLabel}
              </span>
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="px-1 py-6 text-[13px] text-muted">Nada en este rango. Respirá.</div>
        )}
      </div>
    </div>
  );
}
