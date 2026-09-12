"use client";

import { useRouter } from "next/navigation";
import { useSheet } from "@/components/providers/OverlayProvider";

export function PerfilSheet({
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
  const router = useRouter();
  const { closeSheet } = useSheet();

  const rows: Array<{ label: string; go: () => void }> = [
    { label: "Mi perfil y alias", go: () => router.push(`/personas/${meId}`) },
    { label: "Personas del grupo", go: () => router.push("/personas") },
    { label: "Ajustes", go: () => router.push("/config") },
    {
      label: "Salir de la sesión",
      go: () => {
        fetch("/api/auth/logout", { method: "POST" }).finally(() => {
          router.push("/login");
          router.refresh();
        });
      },
    },
  ];

  return (
    <div className="flex flex-col pb-1">
      <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
        {username}
      </div>
      <div className="mt-1.5 text-[12px] text-muted">
        {alias} · cumple el {birthdayLabel}
      </div>
      <div className="mt-4 flex flex-col">
        {rows.map((row) => (
          <button
            key={row.label}
            type="button"
            onClick={() => {
              closeSheet();
              row.go();
            }}
            className="flex items-center gap-3 border-t border-line py-4 text-left"
          >
            <span className="flex-1 text-[15px] font-semibold">{row.label}</span>
            <span className="text-[14px] text-faint">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
