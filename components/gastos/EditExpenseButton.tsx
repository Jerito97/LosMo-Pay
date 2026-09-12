"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { EditExpenseSheet } from "@/components/sheets/EditExpenseSheet";

export function EditExpenseButton({
  expenseId,
  currentDescription,
  currentAmount,
}: {
  expenseId: string;
  currentDescription: string;
  currentAmount: number;
}) {
  const { openSheet } = useSheet();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        openSheet(
          <EditExpenseSheet
            expenseId={expenseId}
            currentDescription={currentDescription}
            currentAmount={currentAmount}
          />,
        )
      }
    >
      Editar gasto
    </Button>
  );
}
