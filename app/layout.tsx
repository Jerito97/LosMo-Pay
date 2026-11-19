import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/session";
import "./globals.css";

// VERCEL_PROJECT_PRODUCTION_URL la pone Vercel solo (sin configurar nada):
// hace falta una URL absoluta para que WhatsApp/redes puedan ir a buscar la
// imagen del link preview, una ruta relativa no les sirve.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const description = "Administración de gastos de LosMo";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "LosMo Pay",
  description,
  openGraph: {
    title: "LosMo Pay",
    description,
    images: [{ url: "/logo-losmo-pay.png", width: 1254, height: 1254 }],
  },
  twitter: {
    card: "summary",
    title: "LosMo Pay",
    description,
    images: ["/logo-losmo-pay.png"],
  },
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
