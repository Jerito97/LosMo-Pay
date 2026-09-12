"use client";

import { NotifBell } from "@/components/notifications/NotifBell";
import { PerfilSheet } from "@/components/sheets/PerfilSheet";
import { useSheet } from "@/components/providers/OverlayProvider";
import { initials } from "@/lib/format";

export function InicioHeaderActions({
  meId,
  username,
  alias,
  birthdayLabel,
}: {
  meId: string;
  username: string;
  alias: string;
  birthdayLabel: string;
}) {
  const { openSheet } = useSheet();

  return (
    <div className="flex flex-none gap-2">
      <NotifBell />
      <button
        type="button"
        onClick={() =>
          openSheet(
            <PerfilSheet
              meId={meId}
              username={username}
              alias={alias}
              birthdayLabel={birthdayLabel}
            />,
          )
        }
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-wine text-[13px] font-bold text-onwine"
      >
        {initials(username)}
      </button>
    </div>
  );
}
