"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { DeletePersonSheet } from "@/components/sheets/DeletePersonSheet";

export function DeletePersonButton({ personId, personName }: { personId: string; personName: string }) {
  const { openSheet } = useSheet();

  return (
    <Button
      variant="danger-outline"
      onClick={() => openSheet(<DeletePersonSheet personId={personId} personName={personName} />)}
    >
      Eliminar persona
    </Button>
  );
}
