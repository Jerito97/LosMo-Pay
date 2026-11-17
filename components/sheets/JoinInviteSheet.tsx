"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { joinExpense } from "@/lib/actions/expenses";
import { money } from "@/lib/format";

export function JoinInviteSheet({
  expenseId,
  description,
  amount,
}: {
  expenseId: string;
  description: string;
  amount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Saca el "?invite=1" de la URL para que no te vuelva a preguntar si
  // refrescás o volvés a esta pantalla.
  function dismiss() {
    closeSheet();
    router.replace(pathname);
  }

  function handleJoin() {
    setError(null);
    startTransition(async () => {
      try {
        await joinExpense(expenseId);
        closeSheet();
        showToast("Te sumaste al gasto");
        router.replace(pathname);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo sumar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          ¿Te sumás a este gasto?
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          &quot;{description}&quot; · {money(amount)}
        </div>
      </div>

      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}

      <Button onClick={handleJoin} disabled={pending}>
        {pending ? "Sumando…" : "Sí, sumarme"}
      </Button>
      <Button variant="secondary" onClick={dismiss} disabled={pending}>
        No, gracias
      </Button>
    </div>
  );
}
