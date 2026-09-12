"use client";

import { useState } from "react";

export function AliasCopyCard({ alias }: { alias: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(alias);
    } catch {
      // Clipboard puede no estar disponible (http, permisos); no es crítico.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mt-2.5 flex items-stretch overflow-hidden rounded-2xl border border-line bg-card shadow-[0_2px_8px_rgba(43,16,21,0.04)]">
      <span className="min-w-0 flex-1 truncate p-3.5 text-[14.5px] font-semibold">{alias}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex-none cursor-pointer bg-wine px-4.5 text-[11px] font-bold tracking-wide text-onwine uppercase"
      >
        {copied ? "listo" : "copiar"}
      </button>
    </div>
  );
}
