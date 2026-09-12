"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/inicio",
    label: "Inicio",
    icon: '<path d="M3 11l9-7.5 9 7.5"></path><path d="M5.5 9.8V20h13V9.8"></path>',
  },
  {
    href: "/fechas",
    label: "Fechas",
    icon: '<rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M3 10h18M8 3v4M16 3v4"></path>',
  },
  {
    href: "/gastos",
    label: "Gastos",
    icon: '<path d="M3 7h18v12H3z"></path><path d="M3 11h18"></path><circle cx="8" cy="15" r="1.4"></circle>',
  },
  {
    href: "/personas",
    label: "Personas",
    icon: '<circle cx="9" cy="8" r="3.4"></circle><path d="M3 20c0-3.2 2.7-5.2 6-5.2s6 2 6 5.2"></path><path d="M16 5.4a3.2 3.2 0 0 1 0 6.1M17.5 19.8c0-2.3-.7-3.9-2-5"></path>',
  },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center">
      <div
        className="flex w-full max-w-[430px] gap-1 border-t border-line bg-paper px-3.5 pt-2"
        style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}
      >
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 pb-[8px] text-[9.5px] font-bold tracking-wide uppercase ${
                active ? "bg-wine text-onwine" : "bg-transparent text-muted"
              }`}
            >
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: tab.icon }}
              />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
