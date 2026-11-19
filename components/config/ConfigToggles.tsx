"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTheme, toggleNotifPref } from "@/lib/actions/profile";
import { Segmented } from "@/components/ui/Segmented";

interface Prefs {
  cumple: boolean;
  gasto: boolean;
  resumen: boolean;
}

type Theme = "claro" | "oscuro" | "sistema";

const ROWS: Array<{ key: keyof Prefs; label: string; sub: string }> = [
  { key: "cumple", label: "Cumpleaños", sub: "La mañana del día, a las 9." },
  { key: "gasto", label: "Nuevos gastos", sub: "Cuando te suman a un gasto." },
  { key: "resumen", label: "Resumen semanal", sub: "Los lunes, cómo quedó el balance." },
];

export function ConfigToggles({ prefs, theme }: { prefs: Prefs; theme: Theme }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle(key: keyof Prefs) {
    startTransition(async () => {
      await toggleNotifPref(key);
      router.refresh();
    });
  }

  function handleTheme(next: Theme) {
    document.documentElement.dataset.theme = next;
    startTransition(async () => {
      await setTheme(next);
      router.refresh();
    });
  }

  return (
    <>
      <div className="mt-6 px-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
        Avisos
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        <div className="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 text-left shadow-[0_2px_8px_rgba(43,16,21,0.04)]">
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold">Recordatorio de pago</span>
            <span className="mt-0.5 block text-[11.5px] text-muted">
              A los 3 días de un gasto sin pagar, y cada 3 días más. No se puede desactivar.
            </span>
          </span>
          <span className="flex-none rounded-full border border-line2 px-2.5 py-1 text-[10px] font-bold tracking-wide text-accent uppercase">
            Siempre
          </span>
        </div>
        {ROWS.map((row) => (
          <button
            key={row.key}
            type="button"
            disabled={pending}
            onClick={() => handleToggle(row.key)}
            className="flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 text-left shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold">{row.label}</span>
              <span className="mt-0.5 block text-[11.5px] text-muted">{row.sub}</span>
            </span>
            <Switch on={prefs[row.key]} />
          </button>
        ))}
      </div>

      <div className="mt-6 px-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
        Apariencia
      </div>
      <div className="mt-2.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]">
        <span className="block text-[14.5px] font-semibold">Modo</span>
        <span className="mt-0.5 block text-[11.5px] text-muted">
          {theme === "sistema"
            ? "Sigue lo que tengas configurado en el teléfono"
            : theme === "oscuro"
              ? "Papel oscuro, tinta clara"
              : "Papel crema, tinta bordó"}
        </span>
        <Segmented
          className="mt-3"
          options={[
            { value: "claro", label: "Claro" },
            { value: "oscuro", label: "Oscuro" },
            { value: "sistema", label: "Sistema" },
          ]}
          value={theme}
          onChange={handleTheme}
        />
      </div>
    </>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span
      className="flex h-[27px] w-[46px] flex-none items-center rounded-full border p-0.5 transition-colors"
      style={{
        background: on ? "var(--wine)" : "transparent",
        borderColor: on ? "var(--wine)" : "var(--line2)",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span
        className="h-[21px] w-[21px] rounded-full transition-all"
        style={{ background: on ? "var(--onwine)" : "var(--knob)" }}
      />
    </span>
  );
}
