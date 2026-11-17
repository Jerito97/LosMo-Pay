"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setError("No pudimos conectarnos. Probá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

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
            Recuperar contraseña
          </h1>

          {sent ? (
            <>
              <p className="mt-3.5 text-[13.5px] text-muted">
                Si ese mail está registrado con contraseña, te mandamos un link para elegir una
                nueva. Revisá tu bandeja (y spam).
              </p>
              <Link
                href="/login"
                className="mt-6 block w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-center text-[15px] font-semibold text-onwine"
              >
                Volver a entrar
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mt-1.5 text-[13px] text-muted">
                Te mandamos un link para elegir una contraseña nueva.
              </p>
              <label className="mt-6 block">
                <span className="text-[13.5px] font-semibold">Tu mail</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="nacho@mail.com"
                  autoComplete="email"
                  required
                  className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
                />
              </label>

              {error && <div className="mt-4 text-[13px] font-medium text-rose">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-[15px] font-semibold text-onwine disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Enviando…" : "Mandarme el link"}
              </button>

              <Link
                href="/login"
                className="mt-5 block text-center text-[12px] font-semibold text-accent"
              >
                Volver a entrar
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
