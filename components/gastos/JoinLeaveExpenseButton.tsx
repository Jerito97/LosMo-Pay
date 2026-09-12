"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";
import { joinExpense, leaveExpense } from "@/lib/actions/expenses";

export function JoinLeaveExpenseButton({
  expenseId,
  isParticipant,
}: {
  expenseId: string;
  isParticipant: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        if (isParticipant) {
          await leaveExpense(expenseId);
          showToast("Te sacaste del gasto");
        } else {
          await joinExpense(expenseId);
          showToast("Te sumaste al gasto");
        }
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo actualizar el gasto");
      }
    });
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={pending}>
        {pending
          ? "Guardando…"
          : isParticipant
            ? "Sacarme de este gasto"
            : "Sumarme a este gasto"}
      </Button>
      {error && <div className="mt-2 text-[13px] font-medium text-rose">{error}</div>}
    </div>
  );
}
