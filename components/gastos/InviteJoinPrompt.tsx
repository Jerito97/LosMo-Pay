"use client";

import { useEffect } from "react";
import { useSheet } from "@/components/providers/OverlayProvider";
import { JoinInviteSheet } from "@/components/sheets/JoinInviteSheet";

/** Abre el popup de "¿te sumás?" apenas se entra por un link de invitación. */
export function InviteJoinPrompt({
  expenseId,
  description,
  amount,
}: {
  expenseId: string;
  description: string;
  amount: number;
}) {
  const { openSheet } = useSheet();

  useEffect(() => {
    openSheet(<JoinInviteSheet expenseId={expenseId} description={description} amount={amount} />);
    // Solo al entrar: no queremos que se reabra en cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
