"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";
import { deleteExpense } from "@/lib/actions/expenses";

export function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await deleteExpense(expenseId);
      router.push("/gastos");
      router.refresh();
      showToast("Gasto eliminado");
    });
  }

  return (
    <Button variant="danger-outline" onClick={handleClick} disabled={pending}>
      {pending ? "Eliminando…" : "Eliminar gasto"}
    </Button>
  );
}
