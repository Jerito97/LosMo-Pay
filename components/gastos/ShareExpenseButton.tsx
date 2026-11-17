"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";
import { money } from "@/lib/format";

export function ShareExpenseButton({
  expenseId,
  description,
  amount,
}: {
  expenseId: string;
  description: string;
  amount: number;
}) {
  const { showToast } = useToast();

  async function handleShare() {
    const url = `${window.location.origin}/gastos/${expenseId}?invite=1`;
    const text = `"${description}" · ${money(amount)} — ¿formás parte? Sumate acá:`;

    if (navigator.share) {
      try {
        await navigator.share({ title: description, text, url });
      } catch {
        // El usuario canceló el share nativo: no es un error real.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
    } catch {
      // Clipboard puede no estar disponible (http, permisos); no es crítico.
    }
    showToast("Link copiado");
  }

  return (
    <Button variant="secondary" onClick={handleShare}>
      Compartir / invitar
    </Button>
  );
}
