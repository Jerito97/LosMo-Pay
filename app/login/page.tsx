"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [alias, setAlias] = useState("");
  const [birthday, setBirthday] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkEmail() {
    const trimmed = email.trim();
    if (!trimmed) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setIsNewUser(!data.exists);
    } catch {
      // Si falla el chequeo, dejamos que el submit decida.
    } finally {
      setChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          ...(isNewUser ? { username: username.trim(), alias: alias.trim(), birthday } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Algo salió mal");
        if (data.error?.includes("nombre, alias y cumpleaños")) setIsNewUser(true);
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
          <label className="block">
            <span className="text-[13.5px] font-semibold">Tu mail</span>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              onBlur={checkEmail}
              type="email"
              placeholder="nacho@mail.com"
              autoComplete="email"
              required
              className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
            />
          </label>

          {isNewUser && (
            <>
              <label className="mt-6 block">
                <span className="text-[13.5px] font-semibold">Tu nombre</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nacho"
                  required
                  className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
                />
              </label>
              <label className="mt-6 block">
                <span className="text-[13.5px] font-semibold">Alias para que te transfieran</span>
                <input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="nacho.losmo"
                  required
                  className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
                />
              </label>
              <label className="mt-6 block">
                <span className="text-[13.5px] font-semibold">Tu cumpleaños</span>
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                  className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
                />
              </label>
            </>
          )}

          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-[13.5px] font-semibold">Contraseña</span>
            {!isNewUser && (
              <Link href="/forgot-password" className="text-[11.5px] font-semibold text-accent">
                ¿La olvidaste?
              </Link>
            )}
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete={isNewUser ? "new-password" : "current-password"}
            required
            minLength={8}
            className="mt-2.5 block w-full rounded-xl border border-line bg-card p-3.5 text-[16px] font-medium text-ink outline-none"
          />

          {error && (
            <div className="mt-4 text-[13px] font-medium text-rose">
              {error}
              {error.includes("usuario y PIN") && (
                <>
                  {" "}
                  <Link href="/migrar-cuenta" className="underline">
                    Migrar mi cuenta vieja
                  </Link>
                </>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || checking || password.length < 8}
            className="mt-6 w-full cursor-pointer rounded-2xl bg-wine px-4 py-[17px] text-[15px] font-semibold text-onwine disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Entrando…" : "Entrar"}
          </button>

          {isNewUser && (
            <p className="mt-4 text-center text-[12px] text-muted">
              No encontramos ese mail en el grupo: vamos a crear tu cuenta.
            </p>
          )}

          <Link
            href="/migrar-cuenta"
            className="mt-5 block text-center text-[12px] font-semibold text-accent"
          >
            ¿Tenés una cuenta vieja con usuario y PIN?
          </Link>
        </form>
      </div>
    </div>
  );
}
