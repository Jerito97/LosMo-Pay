import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPin } from "@/lib/auth/pin";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { migrateLegacySchema } from "@/lib/auth/validation";

/**
 * Puente para cuentas viejas (usuario + PIN) que todavía no tienen mail y
 * contraseña: probás que sos vos con tus credenciales viejas y de paso
 * dejás la cuenta configurada con el login nuevo.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = migrateLegacySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { username, pin, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.username}) = lower(${username})`,
  });
  if (!existing || !existing.pinHash) {
    return NextResponse.json({ error: "No encontramos esa cuenta vieja" }, { status: 404 });
  }

  const validPin = await verifyPin(pin, existing.pinHash);
  if (!validPin) {
    return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
  }

  const emailTaken = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = lower(${email})`,
    columns: { id: true },
  });
  if (emailTaken && emailTaken.id !== existing.id) {
    return NextResponse.json(
      { error: "Ese mail ya está en uso por otra persona del grupo" },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  try {
    await db.update(users).set({ email, passwordHash }).where(eq(users.id, existing.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Ese mail se acaba de ocupar. Probá con otro." },
        { status: 409 },
      );
    }
    throw error;
  }

  const session = await getSession();
  session.userId = existing.id;
  await session.save();
  return NextResponse.json({ ok: true, userId: existing.id });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
