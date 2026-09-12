"use client";

import { Button } from "@/components/ui/Button";
import { useSheet } from "@/components/providers/OverlayProvider";
import { EditProfileSheet } from "@/components/sheets/EditProfileSheet";

export function EditProfileButton({
  currentUsername,
  currentAlias,
  currentBirthday,
}: {
  currentUsername: string;
  currentAlias: string;
  currentBirthday: string;
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
          />,
        )
      }
    >
      Editar mi perfil
    </Button>
  );
}
