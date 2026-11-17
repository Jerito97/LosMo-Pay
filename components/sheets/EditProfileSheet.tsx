"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { updateProfile } from "@/lib/actions/profile";

export function EditProfileSheet({
  currentFullName,
  currentUsername,
  currentAlias,
  currentBirthday,
  currentEmail,
}: {
  currentFullName: string | null;
  currentUsername: string;
  currentAlias: string;
  currentBirthday: string;
  currentEmail: string | null;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [fullName, setFullName] = useState(currentFullName ?? "");
  const [username, setUsername] = useState(currentUsername);
  const [alias, setAlias] = useState(currentAlias);
  const [birthday, setBirthday] = useState(currentBirthday);
  const [email, setEmail] = useState(currentEmail ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await updateProfile({
          fullName,
          username,
          alias,
          birthday,
          newEmail: email !== (currentEmail ?? "") ? email : undefined,
          newPassword: newPassword || undefined,
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
        <div className="mt-1.5 text-[12px] text-muted">
          Tu nombre completo, apodo, alias, cumpleaños, mail y contraseña
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Tu nombre completo</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ignacio Pérez"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Tu apodo</span>
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
        <span className="text-[13.5px] font-semibold">Tu mail</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="nacho@mail.com"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Nueva contraseña (opcional)</span>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          placeholder="Dejalo vacío para no cambiarla"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
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
