"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo salió mal");
        return;
      }
      setDone(true);
    } catch {
      setError("No pudimos conectarnos. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!email || !token) {
    return (
      <p className="mt-3.5 text-[13.5px] text-muted">
        Este link no es válido. Pedí uno nuevo desde{" "}
        <Link href="/forgot-password" className="font-semibold text-accent">
          recuperar contraseña
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <>
        <p className="mt-3.5 text-[13.5px] text-muted">Listo, tu contraseña ya se actualizó.</p>
        <button
          onClick={() => {
            router.push("/login");
          }}
          className="mt-6 w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-[15px] font-semibold text-onwine"
        >
          Entrar
        </button>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mt-1.5 text-[13px] text-muted">Elegí tu nueva contraseña para {email}.</p>
      <label className="mt-6 block">
        <span className="text-[13.5px] font-semibold">Contraseña nueva</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
        />
      </label>

      {error && <div className="mt-4 text-[13px] font-medium text-rose">{error}</div>}

      <button
        type="submit"
        disabled={submitting || password.length < 8}
        className="mt-6 w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-[15px] font-semibold text-onwine disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh justify-center bg-desk">
      <div className="flex min-h-dvh w-full max-w-[430px] flex-col bg-paper text-ink">
        <div className="flex-none bg-wine px-[26px] pt-[62px] pb-[26px] text-onwine">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-losmo-pay.png"
            alt="LosMo Pay"
            width={88}
            height={88}
            className="block rounded-2xl"
          />
          <div className="mt-3.5 h-px bg-[rgba(247,233,228,0.32)]" />
        </div>

        <div className="flex-1 overflow-y-auto px-[26px] py-[22px]">
          <h1 className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
            Nueva contraseña
          </h1>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
