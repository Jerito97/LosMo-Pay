"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";
import { deleteExpense } from "@/lib/actions/expenses";

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteExpense(expenseId);
        router.push("/gastos");
        router.refresh();
        showToast("Gasto eliminado");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo eliminar el gasto");
      }
    });
  }

  return (
    <div>
      <Button variant="danger-outline" onClick={handleClick} disabled={pending}>
        {pending ? "Eliminando…" : "Eliminar gasto"}
      </Button>
      {error && <div className="mt-2 text-[13px] font-medium text-rose">{error}</div>}
    </div>
  );
}
