import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPin, verifyPin } from "@/lib/auth/pin";
import { getSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { username, pin, alias, birthday } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.username}) = lower(${username})`,
  });

  if (existing) {
    const valid = await verifyPin(pin, existing.pinHash);
    if (!valid) {
      return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
    }
    const session = await getSession();
    session.userId = existing.id;
    await session.save();
    return NextResponse.json({ created: false, userId: existing.id });
  }

  // Usuario nuevo: alias y cumpleaños son obligatorios.
  if (!alias || !birthday) {
    return NextResponse.json(
      { error: "Para crear tu cuenta necesitamos tu alias y tu cumpleaños" },
      { status: 400 },
    );
  }

  const aliasTaken = await db.query.users.findFirst({
    where: sql`lower(${users.alias}) = lower(${alias})`,
    columns: { id: true },
  });
  if (aliasTaken) {
    return NextResponse.json(
      { error: "Ese alias ya está en uso por otra persona del grupo" },
      { status: 409 },
    );
  }

  const pinHash = await hashPin(pin);
  let created: { id: string };
  try {
    [created] = await db
      .insert(users)
      .values({ username, alias, birthday, pinHash })
      .returning({ id: users.id });
  } catch (error) {
    // Otra persona se registró con el mismo nombre de usuario o alias en
    // paralelo: los índices únicos de la base ganan la carrera.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Ese nombre de usuario o alias se acaba de ocupar. Probá con otro." },
        { status: 409 },
      );
    }
    throw error;
  }

  const session = await getSession();
  session.userId = created.id;
  await session.save();
  return NextResponse.json({ created: true, userId: created.id });
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
