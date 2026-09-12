"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useSheet, useToast } from "@/components/providers/OverlayProvider";
import { createExpense } from "@/lib/actions/expenses";
import { money } from "@/lib/format";

export function CargarGastoForm({
  meId,
  users,
}: {
  meId: string;
  users: Array<{ id: string; username: string }>;
}) {
  const router = useRouter();
  const { closeSheet } = useSheet();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState(meId);
  const [participantSearch, setParticipantSearch] = useState("");
  const [selected, setSelected] = useState<string[]>(users.map((u) => u.id));
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(participantSearch.trim().toLowerCase()),
  );

  const amountNumber = parseFloat(amount.replace(/[^\d.]/g, "")) || 0;
  const splitHint = useMemo(() => {
    if (selected.length === 0) return "Elegí al menos una persona";
    return amountNumber
      ? `${money(amountNumber / selected.length)} cada uno`
      : `Se divide entre ${selected.length} persona${selected.length === 1 ? "" : "s"}`;
  }, [selected, amountNumber]);

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleSubmit() {
    setError(null);
    if (!description.trim()) return setError("Falta la descripción");
    if (amountNumber <= 0) return setError("El monto tiene que ser mayor a cero");
    if (selected.length === 0) return setError("Elegí al menos una persona");

    startTransition(async () => {
      try {
        await createExpense({
          description,
          amount: amountNumber,
          payerId,
          participantIds: selected,
        });
        closeSheet();
        showToast("Gasto cargado");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el gasto");
      }
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
      <div>
        <div className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
          Cargar gasto
        </div>
        <div className="mt-1.5 text-[12px] text-muted">
          Quién pagó y entre quiénes se reparte
        </div>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Descripción</span>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Súper del finde"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[13.5px] font-semibold">Monto</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="decimal"
          placeholder="$0"
          className="w-full rounded-xl border border-line bg-card p-3.5 text-[15.5px] font-medium text-ink outline-none"
        />
      </label>

      <div>
        <span className="text-[13.5px] font-semibold">Pagado por</span>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5">
          {users.map((u) => {
            const on = payerId === u.id;
            return (
              <button
                key={u.id}
                type="button"
                data-testid="payer-chip"
                data-username={u.username}
                onClick={() => setPayerId(u.id)}
                className={`flex flex-none items-center gap-2 rounded-full border py-[5px] pr-3.5 pl-[5px] text-[13px] font-semibold whitespace-nowrap ${
                  on ? "border-wine bg-wine text-onwine" : "border-line2 bg-transparent text-muted"
                }`}
              >
                <Avatar name={u.username} userId={u.id} size={24} />
                {u.id === meId ? "Vos" : u.username}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-2.5">
          <span className="text-[13.5px] font-semibold">Se divide entre</span>
          <span className="text-[12px] font-bold text-accent">
            {selected.length} de {users.length}
          </span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 rounded-full border border-line bg-card px-4">
          <input
            value={participantSearch}
            onChange={(e) => setParticipantSearch(e.target.value)}
            placeholder={`Buscar entre ${users.length} personas`}
            className="min-w-0 flex-1 bg-transparent py-3.5 text-[14.5px] font-medium text-ink outline-none"
          />
        </div>
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5">
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
        <div className="mt-2.5 flex max-h-[196px] flex-col gap-2 overflow-y-auto">
          {filteredUsers.map((u) => {
            const on = selected.includes(u.id);
            return (
              <button
                key={u.id}
                type="button"
                data-testid="participant-option"
                data-username={u.username}
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
          {filteredUsers.length === 0 && (
            <div className="px-0.5 py-4.5 text-[13px] text-muted">Nadie con ese nombre.</div>
          )}
        </div>
        <div className="mt-3 text-[12.5px] text-muted">{splitHint}</div>
      </div>

      {error && <div className="text-[13px] font-medium text-rose">{error}</div>}

      <Button onClick={handleSubmit} disabled={pending}>
        {pending ? "Guardando…" : "Guardar gasto"}
      </Button>
      <button
        type="button"
        onClick={closeSheet}
        className="cursor-pointer bg-transparent p-0.5 text-[12.5px] font-semibold text-muted"
      >
        Cancelar
      </button>
    </div>
  );
}
