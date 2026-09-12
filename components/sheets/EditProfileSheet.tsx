"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { updateProfile } from "@/lib/actions/profile";

export function EditProfileSheet({
  currentUsername,
  currentAlias,
  currentBirthday,
}: {
  currentUsername: string;
  currentAlias: string;
  currentBirthday: string;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState(currentUsername);
  const [alias, setAlias] = useState(currentAlias);
  const [birthday, setBirthday] = useState(currentBirthday);
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProfile({
          username,
          alias,
          birthday,
          newPin: newPin || undefined,
        });
        closeSheet();
        showToast("Perfil actualizado");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Editar mi perfil
        </div>
        <div className="mt-1.5 text-[12px] text-muted">Tu nombre, alias, cumpleaños y PIN</div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Tu nombre</span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Nacho"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Alias para que te transfieran</span>
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="nacho.losmo"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Tu cumpleaños</span>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Nuevo PIN (opcional)</span>
        <input
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          type="password"
          placeholder="Dejalo vacío para no cambiarlo"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium tracking-[0.2em] text-ink outline-none"
        />
      </label>

      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}

      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </Button>
      <Button variant="secondary" onClick={closeSheet} disabled={pending}>
        Cancelar
      </Button>
    </div>
  );
}
