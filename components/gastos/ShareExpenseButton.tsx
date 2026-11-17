"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";

export function ShareExpenseButton({ expenseId }: { expenseId: string }) {
  const { showToast } = useToast();

  async function handleShare() {
    const url = `${window.location.origin}/gastos/${expenseId}?invite=1`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard puede no estar disponible (http, permisos); no es crítico.
    }
    showToast("Link copiado");
  }

  return (
    <Button variant="secondary" onClick={handleShare}>
      Copiar link para invitar
    </Button>
  );
}
