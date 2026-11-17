import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { resetPasswordSchema } from "@/lib/auth/validation";
import { verifyResetToken } from "@/lib/auth/resetToken";
import { hashPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 },
    );
  }
  const { email, token, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = lower(${email})`,
  });

  if (
    !existing ||
    !existing.resetTokenHash ||
    !existing.resetTokenExpiresAt ||
    existing.resetTokenExpiresAt.getTime() < Date.now() ||
    !verifyResetToken(token, existing.resetTokenHash)
  ) {
    return NextResponse.json({ error: "El link venció o no es válido. Pedí uno nuevo." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({ passwordHash, resetTokenHash: null, resetTokenExpiresAt: null })
    .where(eq(users.id, existing.id));

  return NextResponse.json({ ok: true });
}
