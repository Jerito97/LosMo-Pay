"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { updateExpenseDetails } from "@/lib/actions/expenses";

export function EditExpenseSheet({
  expenseId,
  currentDescription,
  currentAmount,
}: {
  expenseId: string;
  currentDescription: string;
  currentAmount: number;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [description, setDescription] = useState(currentDescription);
  const [amount, setAmount] = useState(String(Math.round(currentAmount)));
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    const parsed = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
    if (!description.trim()) return setError("Falta la descripción");
    if (parsed <= 0) return setError("El monto tiene que ser mayor a cero");

    startTransition(async () => {
      try {
        await updateExpenseDetails(expenseId, { description, amount: parsed });
        closeSheet();
        showToast("Gasto actualizado");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Editar gasto
        </div>
        <div className="mt-1.5 text-[12px] text-muted">Corregí la descripción o el monto</div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Descripción</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Súper del finde"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Monto</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="$0"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}

      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
      <Button variant="secondary" onClick={closeSheet} disabled={pending}>
        Cancelar
      </Button>
    </div>
  );
}
