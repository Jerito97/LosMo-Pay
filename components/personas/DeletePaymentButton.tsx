"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/OverlayProvider";
import { deletePayment } from "@/lib/actions/payments";

export function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        await deletePayment(paymentId);
        showToast("Pago deshecho");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo deshacer el pago");
      }
    });
  }

  return (
    <span className="flex-none">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label="Deshacer pago"
        className="flex h-7 w-7 items-center justify-center rounded-full border border-line2 text-[12px] font-bold text-rose disabled:opacity-50"
      >
        {pending ? "…" : "✕"}
      </button>
      {error && <div className="mt-1 text-[11px] font-medium text-rose">{error}</div>}
    </span>
  );
}
