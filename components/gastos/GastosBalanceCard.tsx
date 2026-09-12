"use client";

import { useState } from "react";
import { WineCard } from "@/components/ui/Card";
import { money, signedMoney } from "@/lib/format";

export interface BalanceBar {
  userId: string;
  name: string;
  amount: number; // positivo: te debe, negativo: le debés
}

export function GastosBalanceCard({ net, bars }: { net: number; bars: BalanceBar[] }) {
  const [open, setOpen] = useState(false);
  const max = Math.max(1, ...bars.map((b) => Math.abs(b.amount)));

  return (
    <WineCard>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full cursor-pointer bg-transparent p-0 text-left text-inherit"
      >
        <span className="flex items-baseline justify-between gap-2.5">
          <span className="text-[10px] font-bold tracking-[0.18em] text-onwine3 uppercase">
            Tu saldo neto
          </span>
          <span className="text-[11.5px] text-onwine2">
            {net > 0 ? "a favor tuyo" : net < 0 ? "en contra" : "sin deudas abiertas"}
          </span>
        </span>
        <span className="mt-1.5 flex items-end justify-between gap-2.5">
          <span className="font-[family-name:var(--font-display)] text-[46px] leading-[0.95]">
            {net === 0 ? "Al día" : signedMoney(net)}
          </span>
          <span className="flex items-center gap-1.5 pb-1.5 text-[11px] font-bold tracking-wide text-onwine3 uppercase">
            {open ? "Ocultar" : "Quién debe"}
            <span
              className="text-[13px] transition-transform"
              style={{ transform: open ? "rotate(180deg)" : "none" }}
            >
              ⌄
            </span>
          </span>
        </span>
      </button>

      {open && bars.length > 0 && (
        <div className="[animation:sIn_.22s_ease-out]">
          <div className="mt-4.5 flex flex-col gap-2.5 border-t border-[rgba(247,233,228,0.28)] pt-4">
            {bars.map((bar) => {
              const pct = `${Math.round((Math.abs(bar.amount) / max) * 100)}%`;
              return (
                <div key={bar.userId} className="flex items-center gap-2.5">
                  <span className="w-[46px] flex-none overflow-hidden text-[12px] font-semibold text-onwine text-ellipsis whitespace-nowrap">
                    {bar.name}
                  </span>
                  <span className="grid h-3.5 flex-1 grid-cols-[1fr_1px_1fr] items-center">
                    <span className="flex justify-end">
                      <span
                        className="h-2.5 rounded-l-[5px] bg-onwine2"
                        style={{ width: bar.amount < 0 ? pct : "0%" }}
                      />
                    </span>
                    <span className="h-3.5 bg-[rgba(247,233,228,0.34)]" />
                    <span className="flex">
                      <span
                        className="h-2.5 rounded-r-[5px] bg-rose2"
                        style={{ width: bar.amount > 0 ? pct : "0%" }}
                      />
                    </span>
                  </span>
                  <span
                    className="w-[70px] flex-none text-right text-[12.5px] font-semibold"
                    style={{ color: bar.amount > 0 ? "var(--onwine)" : "var(--onwine2)" }}
                  >
                    {money(bar.amount)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-[10px] font-bold tracking-[0.14em] text-onwine3 uppercase">
            <span>Le debés</span>
            <span>Te deben</span>
          </div>
        </div>
      )}
    </WineCard>
  );
}
