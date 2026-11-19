import { cache } from "react";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export interface SessionData {
  userId?: string;
}

function requireSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters (see .env.example)",
    );
  }
  return secret;
}

export const sessionCookieName = "losmopay_session";

// Función (no una constante de módulo): así SESSION_SECRET solo se valida
// cuando de verdad se maneja una sesión, no cuando Next.js importa este
// archivo en build time para recolectar datos de las rutas.
export function getSessionOptions(): SessionOptions {
  return {
    password: requireSessionSecret(),
    cookieName: sessionCookieName,
    // `ttl: 0` le dice a iron-session que no selle una expiración dentro de
    // la cookie: sin esto, por defecto usa 14 días *aunque* cookieOptions.
    // maxAge diga otra cosa, y la sesión queda "vencida" del lado del
    // servidor bastante antes de que el navegador borre la cookie -el bug
    // real detrás de los desloguéos inesperados.
    ttl: 0,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365 * 2, // 2 años: de ahora en más, solo se cierra la sesión si uno lo pide
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

// cache(): el layout raíz y la página de cada ruta llaman a esto por
// separado para lo mismo (tema + sesión) en cada navegación. Sin esto, cada
// click en una pestaña dispara dos round-trips idénticos a Neon en vez de
// uno solo.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  return user ?? null;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No hay una sesión activa");
  }
  return user;
}
