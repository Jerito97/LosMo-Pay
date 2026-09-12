"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { money, signedMoney } from "@/lib/format";

export interface ExpenseRow {
  id: string;
  description: string;
  amount: number;
  payerId: string;
  payerName: string;
  sub: string;
  dateLabel: string;
  effect: number; // 0 si no participo
}

export function GastosExpenseList({ rows }: { rows: ExpenseRow[] }) {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const matches = q
    ? rows.filter((r) => r.description.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q))
    : rows;

  const dateOrder: string[] = [];
  for (const r of matches) if (!dateOrder.includes(r.dateLabel)) dateOrder.push(r.dateLabel);
  const groups = dateOrder.map((label) => {
    const items = matches.filter((r) => r.dateLabel === label);
    return { label, items, total: items.reduce((s, r) => s + r.amount, 0) };
  });

  return (
    <div>
      <div className="mt-6.5 flex items-baseline justify-between gap-2.5 px-1">
        <span className="font-[family-name:var(--font-display)] text-[23px]">Todos los gastos</span>
        <span className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
          {matches.length} {matches.length === 1 ? "gasto" : "gastos"}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2.5 rounded-full border border-line bg-card px-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar gasto o persona"
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
            <span className="text-[11px] font-semibold text-faint">{money(group.total)}</span>
          </div>
          <div className="mt-2.5 flex flex-col gap-2.5">
            {group.items.map((r) => (
              <Link
                key={r.id}
                href={`/gastos/${r.id}`}
                className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
              >
                <Avatar name={r.payerName} userId={r.payerId} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold tracking-tight">
                    {r.description}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted">{r.sub}</span>
                </span>
                <span className="flex-none text-right">
                  <span className="block text-[16.5px] font-semibold">{money(r.amount)}</span>
                  <span
                    className="mt-0.5 block text-[11.5px] font-semibold"
                    style={{ color: r.effect === 0 ? "var(--faint)" : r.effect < 0 ? "var(--rose)" : "var(--brand-ink)" }}
                  >
                    {r.effect === 0 ? "no participás" : signedMoney(r.effect)}
                  </span>
                </span>
                <span className="flex-none text-[15px] text-faint">›</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {matches.length === 0 && (
        <div className="px-1 py-6.5 text-[13px] text-muted">Sin gastos que coincidan con esa búsqueda.</div>
      )}
    </div>
  );
}
