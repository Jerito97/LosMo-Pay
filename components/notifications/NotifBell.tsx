"use client";

import { useNotifications } from "./NotificationsProvider";

export function NotifBell() {
  const { unreadCount, openDrawer } = useNotifications();

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-card text-brand-ink"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      >
        <path d="M18 15V10a6 6 0 1 0-12 0v5l-1.6 2.4h15.2z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </svg>
      {unreadCount > 0 && (
        <span
          className="absolute -top-[3px] -right-[3px] flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-paper bg-rose px-1 text-[10px] font-bold text-white"
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}
