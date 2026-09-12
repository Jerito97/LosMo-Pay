import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "LosMo Pay",
  description: "Cumpleaños y gastos compartidos del grupo.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LosMo Pay",
  },
  other: {
    // Algunos iOS más viejos solo reconocen el meta tag legacy, no el
    // estándar "mobile-web-app-capable" que emite appleWebApp por sí solo.
    "apple-mobile-web-app-capable": "yes",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const theme = user?.themePref ?? "claro";

  return (
    <html lang="es" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
