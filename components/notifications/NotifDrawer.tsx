"use client";

import { useRouter } from "next/navigation";
import { initials } from "@/lib/format";
import { useNotifications, type NotificationItem } from "./NotificationsProvider";

const TYPE_TARGET: Record<NotificationItem["type"], string> = {
  birthday: "/fechas",
  expense_added: "/gastos",
  payment_received: "/gastos",
  weekly_summary: "/gastos",
};

const TYPE_TONE: Record<NotificationItem["type"], "a" | "b"> = {
  birthday: "a",
  expense_added: "b",
  payment_received: "b",
  weekly_summary: "b",
};

export function NotifDrawer() {
  const { notifications, drawerOpen, closeDrawer, dismiss, dismissAll } = useNotifications();
  const router = useRouter();

  if (!drawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-[rgba(43,16,21,0.5)] [animation:fIn_.18s_ease-out]"
      onClick={closeDrawer}
    >
      <div className="ml-auto h-full w-full max-w-[430px]">
        <div
          className="ml-auto flex h-full w-[310px] flex-col bg-paper shadow-[-18px_0_40px_rgba(43,16,21,0.25)] [animation:rIn_.24s_cubic-bezier(.2,.8,.3,1)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-none items-start justify-between gap-2.5 bg-wine px-[18px] pt-[58px] pb-[18px] text-onwine">
            <span>
              <span className="block font-[family-name:var(--font-display)] text-[26px] leading-none">
                Avisos
              </span>
              <span className="mt-1 block text-[11px] font-semibold text-onwine3">
                {notifications.length ? `${notifications.length} sin leer` : "todo leído"}
              </span>
            </span>
            <button
              type="button"
              onClick={closeDrawer}
              className="flex h-[30px] w-[30px] flex-none cursor-pointer items-center justify-center rounded-full border border-[rgba(247,233,228,0.4)] bg-transparent text-[12px] text-onwine"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-[18px] py-1">
            {notifications.map((n) => {
              const tone = TYPE_TONE[n.type];
              return (
                <div
                  key={n.id}
                  className="mt-2.5 flex items-start gap-1 rounded-2xl border border-line bg-card pr-0.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      closeDrawer();
                      router.push(TYPE_TARGET[n.type]);
                    }}
                    className="flex flex-1 items-start gap-2.5 py-3.5 pl-3.5 text-left"
                  >
                    <span
                      className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[11px] font-bold"
                      style={{
                        background: tone === "a" ? "var(--rose2)" : "#e2cfc6",
                        color: tone === "a" ? "#fff" : "var(--wine)",
                      }}
                    >
                      {initials(n.title)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-tight">
                        {n.title}
                      </span>
                      <span className="mt-[3px] block text-[12px] leading-snug text-muted">
                        {n.body}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => dismiss(n.id)}
                    className="h-12 w-8 flex-none cursor-pointer text-[12px] text-faint"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="px-1.5 py-10 text-center text-[13px] text-muted">
                Estás al día.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={dismissAll}
            className="mx-[18px] my-3.5 flex-none cursor-pointer rounded-full border border-line2 py-3.5 text-[11px] font-bold tracking-wide text-accent uppercase"
            style={{ marginBottom: "calc(28px + env(safe-area-inset-bottom))" }}
          >
            Marcar todo leído
          </button>
        </div>
      </div>
    </div>
  );
}
