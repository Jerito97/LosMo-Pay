"use client";

import { useState } from "react";
import { WineCard } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { money, signedMoney } from "@/lib/format";

export interface BalanceBar {
  userId: string;
  name: string;
  amount: number; // positivo: te debe, negativo: le debés
}

export function GastosBalanceCard({ net, bars }: { net: number; bars: BalanceBar[] }) {
  const [open, setOpen] = useState(false);

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
          <div className="mt-4.5 flex flex-col gap-3 border-t border-[rgba(247,233,228,0.28)] pt-4">
            {bars.map((bar) => (
              <div key={bar.userId} className="flex items-center gap-3">
                <Avatar name={bar.name} userId={bar.userId} size={34} />
                <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold text-onwine">
                  {bar.name}
                </span>
                <span className="flex-none text-right">
                  <span className="block text-[9.5px] font-bold tracking-[0.12em] text-onwine3 uppercase">
                    {bar.amount > 0 ? "te debe" : "le debés"}
                  </span>
                  <span
                    className="mt-0.5 block text-[14px] font-semibold"
                    style={{ color: bar.amount > 0 ? "var(--onwine)" : "var(--rose2)" }}
                  >
                    {money(bar.amount)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WineCard>
  );
}
