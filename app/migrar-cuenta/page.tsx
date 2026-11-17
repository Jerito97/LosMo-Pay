"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function MigrarCuentaPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/migrate-legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin, email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo salió mal");
        return;
      }
      router.push("/inicio");
      router.refresh();
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-[26px] py-[22px]">
          <h1 className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
            Migrar mi cuenta vieja
          </h1>
          <p className="mt-1.5 text-[13px] text-muted">
            Probá que sos vos con tu usuario y PIN de antes, y dejamos tu cuenta con mail y
            contraseña de ahora en más.
          </p>

          <label className="mt-6 block">
            <span className="text-[13.5px] font-semibold">Tu usuario viejo</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nacho"
              autoComplete="username"
              required
              className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
            />
          </label>

          <label className="mt-6 block">
            <span className="text-[13.5px] font-semibold">Tu PIN viejo</span>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              type="password"
              placeholder="••••••"
              required
              className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[24px] font-semibold tracking-[0.34em] text-ink outline-none"
            />
          </label>

          <div className="mt-6 h-px bg-line" />

          <label className="mt-6 block">
            <span className="text-[13.5px] font-semibold">Tu mail nuevo</span>
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

          <label className="mt-6 block">
            <span className="text-[13.5px] font-semibold">Tu contraseña nueva</span>
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
            disabled={submitting || pin.length < 4 || password.length < 8}
            className="mt-6 w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-[15px] font-semibold text-onwine disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Migrando…" : "Migrar mi cuenta"}
          </button>

          <Link
            href="/login"
            className="mt-5 block text-center text-[12px] font-semibold text-accent"
          >
            Volver a entrar
          </Link>
        </form>
      </div>
    </div>
  );
}
