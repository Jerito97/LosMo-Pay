"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Status = "checking" | "unsupported" | "off" | "on" | "denied";

export function PushOptIn() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("unsupported"));
  }, []);

  async function handleEnable() {
    setError(null);
    setBusy(true);
    try {
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Notificaciones push no configuradas todavía");

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setStatus("on");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo activar");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setError(null);
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("off");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo desactivar");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") return null;

  return (
    <>
      <div className="mt-6 px-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
        Notificaciones push
      </div>

      {status === "unsupported" && (
        <div className="mt-2.5 rounded-2xl border border-line bg-card p-3.5 text-[12px] text-muted">
          Tu navegador no soporta notificaciones push. En iPhone, agregá LosMo Pay a la pantalla de
          inicio primero (compartir → Agregar a inicio) y abrila desde ahí.
        </div>
      )}

      {status === "denied" && (
        <div className="mt-2.5 rounded-2xl border border-line bg-card p-3.5 text-[12px] text-muted">
          Bloqueaste las notificaciones para esta app. Para activarlas, habilitalas desde los
          ajustes del navegador o del teléfono.
        </div>
      )}

      {(status === "on" || status === "off") && (
        <button
          type="button"
          disabled={busy}
          onClick={status === "on" ? handleDisable : handleEnable}
          className="mt-2.5 flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 text-left shadow-[0_2px_8px_rgba(43,16,21,0.04)] disabled:opacity-60"
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[14.5px] font-semibold">
              {status === "on" ? "Desactivar notificaciones push" : "Activar notificaciones push"}
            </span>
            <span className="mt-0.5 block text-[11.5px] text-muted">
              {status === "on"
                ? "Dejás de recibir avisos en este teléfono"
                : "Recibí los avisos aunque no tengas la app abierta"}
            </span>
          </span>
        </button>
      )}

      {error && <div className="mt-2 px-1 text-[12px] font-medium text-rose">{error}</div>}
    </>
  );
}
