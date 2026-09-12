"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface NotificationItem {
  id: string;
  type: "birthday" | "expense_added" | "payment_received" | "weekly_summary";
  title: string;
  body: string;
  createdAt: string;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  refresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    fetch(`/api/notifications/${id}/dismiss`, { method: "POST" }).catch(() => {});
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
    fetch("/api/notifications/dismiss-all", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount: notifications.length,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        dismiss,
        dismissAll,
        refresh,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
