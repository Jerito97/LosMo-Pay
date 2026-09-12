"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { deleteUser } from "@/lib/actions/users";

export function DeletePersonSheet({ personId, personName }: { personId: string; personName: string }) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(personId);
        closeSheet();
        showToast("Persona eliminada");
        router.push("/personas");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo eliminar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Eliminar a {personName}
        </div>
        <div className="mt-1.5 text-[12.5px] text-muted">
          Se borra la persona y todo lo que tenga que ver con ella: los gastos que pagó o cargó
          (enteros, aunque hayan participado otros), los pagos que hizo o recibió, y se la saca de
          los gastos ajenos en los que participaba. No se puede deshacer.
        </div>
      </div>

      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}

      <Button variant="danger-outline" onClick={handleConfirm} disabled={pending}>
        {pending ? "Eliminando…" : "Eliminar para siempre"}
      </Button>
      <Button variant="secondary" onClick={closeSheet} disabled={pending}>
        Cancelar
      </Button>
    </div>
  );
}
