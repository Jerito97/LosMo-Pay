"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { SaldarSheet } from "@/components/sheets/SaldarSheet";
import { money } from "@/lib/format";

export function PersonaCta({
  counterpartyId,
  amount,
}: {
  counterpartyId: string;
  amount: number; // positivo: te debe, negativo: le debés
}) {
  const { openSheet } = useSheet();

  if (amount === 0) {
    return (
      <button
        type="button"
        disabled
        className="mt-4 w-full cursor-not-allowed rounded-[14px] bg-card px-4 py-[17px] text-[14px] font-semibold text-muted"
      >
        Sin deudas pendientes
      </button>
    );
  }

  const direction = amount < 0 ? "pay" : "collect";
  const label = amount < 0 ? `Pagarle ${money(amount)}` : "Marcar como cobrado";

  return (
    <div className="mt-4">
      <Button
        onClick={() =>
          openSheet(
            <SaldarSheet
              counterpartyId={counterpartyId}
              direction={direction}
              suggestedAmount={Math.abs(amount)}
            />,
          )
        }
      >
        {label}
      </Button>
    </div>
  );
}
