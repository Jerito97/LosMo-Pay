"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { updateExpenseParticipants } from "@/lib/actions/expenses";

export function ManageParticipantsSheet({
  expenseId,
  meId,
  users,
  currentParticipantIds,
}: {
  expenseId: string;
  meId: string;
  users: Array<{ id: string; username: string }>;
  currentParticipantIds: string[];
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(currentParticipantIds);
  const [error, setError] = useState<string | null>(null);

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.trim().toLowerCase()),
  );

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit() {
    setError(null);
    if (selected.length === 0) {
      setError("El gasto necesita al menos una persona");
      return;
    }
    startTransition(async () => {
      try {
        await updateExpenseParticipants(expenseId, selected);
        closeSheet();
        showToast("Participantes actualizados");
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
          Editar participantes
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          Sumá o sacá a cualquier persona del grupo
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-full border border-line bg-card px-4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--faint)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Buscar entre ${users.length} personas`}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-[14.5px] font-medium text-ink outline-none"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setSelected(users.map((u) => u.id))}
          className="flex-none rounded-full border border-line2 px-3 py-2 text-[12px] font-semibold text-brand-ink whitespace-nowrap"
        >
          Todos ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setSelected([])}
          className="flex-none rounded-full border border-line2 px-3 py-2 text-[12px] font-semibold text-brand-ink whitespace-nowrap"
        >
          Ninguno
        </button>
      </div>

      <div className="flex items-center justify-between gap-2.5">
        <span className="text-[13.5px] font-semibold">Participantes</span>
        <span className="text-[12px] font-bold text-accent">
          {selected.length} de {users.length}
        </span>
      </div>
      <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
        {filtered.map((u) => {
          const on = selected.includes(u.id);
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => toggle(u.id)}
              className="flex w-full items-center gap-2.5 rounded-[14px] border bg-card px-3 py-2.5 text-left"
              style={{ borderColor: on ? "var(--wine)" : "var(--line)" }}
            >
              <Avatar name={u.username} userId={u.id} size={32} />
              <span className="min-w-0 flex-1 text-[15px] font-semibold">
                {u.id === meId ? `${u.username} (vos)` : u.username}
              </span>
              <span
                className="flex h-6 w-6 flex-none items-center justify-center rounded-[7px] border-[1.5px] text-[13px] font-bold text-onwine"
                style={{
                  borderColor: on ? "var(--wine)" : "var(--line2)",
                  background: on ? "var(--wine)" : "transparent",
                }}
              >
                {on ? "✓" : ""}
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-0.5 py-4.5 text-[13px] text-muted">Nadie con ese nombre.</div>
        )}
      </div>

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
