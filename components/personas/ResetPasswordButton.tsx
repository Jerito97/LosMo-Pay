"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { AdminResetPasswordSheet } from "@/components/sheets/AdminResetPasswordSheet";

export function ResetPasswordButton({
  personId,
  personName,
  hasEmail,
}: {
  personId: string;
  personName: string;
  hasEmail: boolean;
}) {
  const { openSheet } = useSheet();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        openSheet(
          <AdminResetPasswordSheet personId={personId} personName={personName} hasEmail={hasEmail} />,
        )
      }
    >
      Cambiar contraseña
    </Button>
  );
}
