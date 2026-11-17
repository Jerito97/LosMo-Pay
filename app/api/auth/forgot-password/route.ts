import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { generateResetToken } from "@/lib/auth/resetToken";
import { sendPasswordResetEmail } from "@/lib/email";

const GENERIC_RESPONSE = {
  ok: true,
  message: "Si ese mail está registrado, te mandamos un link para restablecer la contraseña.",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    // Mismo mensaje genérico para no filtrar si el mail existe o no.
    return NextResponse.json(GENERIC_RESPONSE);
  }
  const { email } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.email}) = lower(${email})`,
    columns: { id: true, passwordHash: true },
  });

  // Solo tiene sentido resetear una contraseña que ya existe: una cuenta
  // vieja sin mail+contraseña todavía pasa por "Migrar mi cuenta vieja".
  if (existing && existing.passwordHash) {
    const { token, tokenHash, expiresAt } = generateResetToken();
    await db
      .update(users)
      .set({ resetTokenHash: tokenHash, resetTokenExpiresAt: expiresAt })
      .where(eq(users.id, existing.id));

    const origin = request.nextUrl.origin;
    const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${token}`;
    await sendPasswordResetEmail(email, resetUrl);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
