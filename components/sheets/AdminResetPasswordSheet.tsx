"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { adminResetPassword } from "@/lib/actions/users";

export function AdminResetPasswordSheet({
  personId,
  personName,
  hasEmail,
}: {
  personId: string;
  personName: string;
  hasEmail: boolean;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await adminResetPassword(personId, password);
        closeSheet();
        showToast("Contraseña actualizada");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Cambiar contraseña
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          Le queda esta contraseña a {personName} para entrar. Pasásela vos directamente.
        </div>
      </div>

      {!hasEmail && (
        <div className="rounded-xl bg-card border border-line p-3 text-[12px] text-muted">
          {personName} todavía no tiene mail cargado, así que no va a poder entrar con mail y
          contraseña hasta que migre su cuenta vieja desde &quot;¿Tenés una cuenta vieja con usuario
          y PIN?&quot; en la pantalla de entrar.
        </div>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Contraseña nueva</span>
        <input
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
          placeholder="Mínimo 8 caracteres"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>
      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}
      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
      <Button variant="secondary" onClick={closeSheet} disabled={pending}>
        Cancelar
      </Button>
    </div>
  );
}
