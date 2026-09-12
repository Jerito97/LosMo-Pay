"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { ManageParticipantsSheet } from "@/components/sheets/ManageParticipantsSheet";

export function EditParticipantsButton({
  expenseId,
  meId,
  users,
  currentParticipantIds,
}: {
  expenseId: string;
  meId: string;
  users: Array<{ id: string; username: string }>;
  currentParticipantIds: string[];
}) {
  const { openSheet } = useSheet();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        openSheet(
          <ManageParticipantsSheet
            expenseId={expenseId}
            meId={meId}
            users={users}
            currentParticipantIds={currentParticipantIds}
          />,
        )
      }
    >
      Editar participantes
    </Button>
  );
}
