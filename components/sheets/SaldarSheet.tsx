"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { createPayment } from "@/lib/actions/payments";

export function SaldarSheet({
  counterpartyId,
  direction,
  suggestedAmount,
}: {
  counterpartyId: string;
  direction: "pay" | "collect";
  suggestedAmount: number;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [amount, setAmount] = useState(String(Math.round(suggestedAmount)));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    const parsed = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    if (parsed <= 0) {
      setError("El monto tiene que ser mayor a cero");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createPayment({ counterpartyId, amount: parsed, direction });
        closeSheet();
        showToast("Pago registrado");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo registrar el pago");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Saldar deuda
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          Queda registrado y se descuenta del balance
        </div>
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Monto a saldar</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="$12.150"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>
      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}
      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Guardando…" : "Marcar como pagado"}
      </Button>
      <button
        type="button"
        onClick={closeSheet}
        className="cursor-pointer bg-transparent p-0.5 text-[12.5px] font-semibold text-muted"
      >
        Cancelar
      </button>
    </div>
  );
}
