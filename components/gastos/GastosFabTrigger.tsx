"use client";

import { Fab } from "@/components/ui/Fab";
import { useSheet } from "@/components/providers/OverlayProvider";
import { CargarGastoForm } from "@/components/sheets/CargarGastoForm";

export function GastosFabTrigger({
  meId,
  users,
}: {
  meId: string;
  users: Array<{ id: string; username: string }>;
}) {
  const { openSheet } = useSheet();
  return (
    <Fab
      label="Cargar gasto"
      onClick={() => openSheet(<CargarGastoForm meId={meId} users={users} />)}
    />
  );
}
