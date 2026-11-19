"use client";

import { useSheet } from "@/components/providers/OverlayProvider";
import { SaldarSheet } from "@/components/sheets/SaldarSheet";

export function CollectShareButton({
  participantId,
  amount,
}: {
  participantId: string;
  amount: number;
}) {
  const { openSheet } = useSheet();

  return (
    <button
      type="button"
      onClick={() =>
        openSheet(
          <SaldarSheet counterpartyId={participantId} direction="collect" suggestedAmount={amount} />,
        )
      }
      className="flex-none cursor-pointer rounded-full bg-wine px-3 py-1.5 text-[11px] font-bold text-onwine"
    >
      Cobrado
    </button>
  );
}
