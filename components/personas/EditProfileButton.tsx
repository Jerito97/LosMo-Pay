"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { EditProfileSheet } from "@/components/sheets/EditProfileSheet";

export function EditProfileButton({
  currentUsername,
  currentAlias,
  currentBirthday,
  currentEmail,
}: {
  currentUsername: string;
  currentAlias: string;
  currentBirthday: string;
  currentEmail: string | null;
}) {
  const { openSheet } = useSheet();

  return (
    <Button
      variant="secondary"
      onClick={() =>
        openSheet(
          <EditProfileSheet
            currentUsername={currentUsername}
            currentAlias={currentAlias}
            currentBirthday={currentBirthday}
            currentEmail={currentEmail}
          />,
        )
      }
    >
      Editar mi perfil
    </Button>
  );
}
