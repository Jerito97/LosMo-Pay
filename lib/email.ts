import { Resend } from "resend";

let cached: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!cached) cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

/**
 * Mientras no haya un dominio propio verificado en Resend, "onboarding@
 * resend.dev" solo entrega mails a la casilla dueña de la cuenta de Resend
 * (restricción de su modo sandbox). Para que le llegue a cualquier
 * integrante del club hace falta verificar un dominio y cambiar este FROM.
 */
const FROM = "LosMo Pay <onboarding@resend.dev>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getResend();
  if (!resend) {
    // Sin RESEND_API_KEY configurada (falta el env var, o estamos en local):
    // no cortamos el flujo, pero dejamos el link en los logs del servidor
    // para poder probarlo igual.
    console.warn(`[email] RESEND_API_KEY no configurada. Link de reseteo para ${to}: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Restablecer tu contraseña de LosMo Pay",
    html: `
      <p>Pediste restablecer tu contraseña de LosMo Pay.</p>
      <p><a href="${resetUrl}">Elegí una contraseña nueva</a></p>
      <p>Este link vence en 1 hora. Si no fuiste vos, ignorá este mail.</p>
    `,
  });

  if (error) {
    console.error("[email] Resend devolvió un error al mandar el reset:", error);
  }
}
