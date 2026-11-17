import { randomBytes, createHash, timingSafeEqual } from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hora

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Token de reseteo: alta entropía, por eso alcanza con SHA-256 (no hace
 * falta el costo de bcrypt, pensado para secretos de baja entropía como
 * contraseñas elegidas por una persona). */
export function generateResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + EXPIRY_MS),
  };
}

export function verifyResetToken(token: string, tokenHash: string): boolean {
  const candidate = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(tokenHash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
