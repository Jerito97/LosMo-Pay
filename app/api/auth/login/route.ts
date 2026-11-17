import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { emailLoginSchema } from "@/lib/auth/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = emailLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { email, password, username, fullName, alias, birthday } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = lower(${email})`,
  });

  if (existing) {
    if (!existing.passwordHash) {
      return NextResponse.json(
        {
          error:
            "Esta cuenta todavía usa usuario y PIN. Migrala a mail y contraseña desde el link de abajo.",
        },
        { status: 409 },
      );
    }
    const valid = await verifyPassword(password, existing.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }
    const session = await getSession();
    session.userId = existing.id;
    await session.save();
    return NextResponse.json({ created: false, userId: existing.id });
  }

  // Mail nuevo: nombre completo, apodo, alias y cumpleaños son obligatorios para crear la cuenta.
  if (!username || !fullName || !alias || !birthday) {
    return NextResponse.json(
      { error: "Para crear tu cuenta necesitamos tu nombre completo, apodo, alias y cumpleaños" },
      { status: 400 },
    );
  }

  const usernameTaken = await db.query.users.findFirst({
    where: sql`lower(${users.username}) = lower(${username})`,
    columns: { id: true },
  });
  if (usernameTaken) {
    return NextResponse.json(
      { error: "Ese nombre ya está en uso por otra persona del grupo" },
      { status: 409 },
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

  const passwordHash = await hashPassword(password);
  let created: { id: string };
  try {
    [created] = await db
      .insert(users)
      .values({ username, fullName, alias, birthday, email, passwordHash })
      .returning({ id: users.id });
  } catch (error) {
    // Otra persona se registró con el mismo mail, nombre o alias en
    // paralelo: los índices únicos de la base ganan la carrera.
    if (isUniqueViolation(error)) {
      return NextResponse.json(
        { error: "Ese mail, nombre o alias se acaba de ocupar. Probá de nuevo." },
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
