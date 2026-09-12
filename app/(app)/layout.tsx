import { OverlayProvider } from "@/components/providers/OverlayProvider";
import { NotificationsProvider } from "@/components/notifications/NotificationsProvider";
import { NotifDrawer } from "@/components/notifications/NotifDrawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-desk">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col bg-paper text-ink">
        <NotificationsProvider>
          <OverlayProvider>
            {children}
            <NotifDrawer />
          </OverlayProvider>
        </NotificationsProvider>
      </div>
    </div>
  );
}
