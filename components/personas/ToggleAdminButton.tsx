"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/OverlayProvider";
import { setAdmin } from "@/lib/actions/users";

export function ToggleAdminButton({ personId, isAdmin }: { personId: string; isAdmin: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await setAdmin(personId, !isAdmin);
        showToast(isAdmin ? "Ya no es admin" : "Ahora es admin");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cambiar el rol");
      }
    });
  }

  return (
    <div>
      <Button variant="secondary" onClick={handleClick} disabled={pending}>
        {pending ? "Guardando…" : isAdmin ? "Sacar admin" : "Hacer admin"}
      </Button>
      {error && <div className="mt-2 text-[13px] font-medium text-rose">{error}</div>}
    </div>
  );
}
