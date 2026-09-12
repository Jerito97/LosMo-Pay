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
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 180, // 180 días
    },
  };
}

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });
  return user ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No hay una sesión activa");
  }
  return user;
}
