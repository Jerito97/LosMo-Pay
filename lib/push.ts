import { sendNotification, setVapidDetails } from "web-push";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  setVapidDetails("mailto:losmopay@example.com", publicKey, privateKey);
  configured = true;
  return true;
}

export async function sendPushToUsers(
  userIds: string[],
  payload: { title: string; body: string; url?: string },
) {
  if (userIds.length === 0) return;
  if (!ensureConfigured()) {
    // Sin las claves VAPID configuradas (falta el env var, o estamos en
    // local): no cortamos el flujo, el aviso en la app sigue andando igual.
    return;
  }

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, userIds));
  if (subs.length === 0) return;

  const json = JSON.stringify(payload);
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // El navegador invalidó esta suscripción (desinstaló la app, etc.).
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
        } else {
          console.error("[push] Error mandando push:", error);
        }
      }
    }),
  );
}
