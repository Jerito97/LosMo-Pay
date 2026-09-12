import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "LosMo Pay",
  description: "Cumpleaños y gastos compartidos del grupo.",
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
