"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { SaldarSheet } from "@/components/sheets/SaldarSheet";
import { money } from "@/lib/format";

export function PayMyShareButton({ payerId, amount }: { payerId: string; amount: number }) {
  const { openSheet } = useSheet();

  return (
    <Button
      onClick={() =>
        openSheet(<SaldarSheet counterpartyId={payerId} direction="pay" suggestedAmount={amount} />)
      }
    >
      Marcar como pagado ({money(amount)})
    </Button>
  );
}
