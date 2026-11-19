import { inArray } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/lib/db/client";
import { notifications, users, type NewNotification } from "@/lib/db/schema";
import { sendPushToUsers } from "@/lib/push";

type NotifType = NewNotification["type"];

/**
 * El recordatorio de pago (payment_reminder) no tiene toggle: devuelve null
 * a propósito para que nunca se filtre. La idea es que nadie se atrase en
 * pagar porque lo desactivó sin querer -el resto de los avisos sí se puede
 * prender y apagar desde Ajustes.
 */
function prefKeyForType(type: NotifType): "cumple" | "gasto" | "resumen" | null {
  if (type === "birthday") return "cumple";
  if (type === "weekly_summary") return "resumen";
  if (type === "payment_reminder") return null;
  return "gasto";
}

function urlForType(type: NotifType): string {
  if (type === "birthday") return "/fechas";
  return "/gastos";
}

export async function notifyUsers(
  userIds: string[],
  notif: {
    type: NotifType;
    title: string;
    body: string;
    targetType?: "expense" | "user";
    targetId?: string;
  },
) {
  const uniqueIds = [...new Set(userIds)];
  if (uniqueIds.length === 0) return;

  const recipients = await db
    .select({ id: users.id, notifPrefs: users.notifPrefs })
    .from(users)
    .where(inArray(users.id, uniqueIds));

  const prefKey = prefKeyForType(notif.type);
  const rows = recipients
    .filter((user) => prefKey === null || user.notifPrefs[prefKey] !== false)
    .map((user) => ({
      userId: user.id,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      targetType: notif.targetType,
      targetId: notif.targetId,
    }));

  if (rows.length) {
    await db.insert(notifications).values(rows);
    // El push se manda después de responder: una notificación lenta o un
    // endpoint caído nunca debe hacer esperar al usuario que cargó el gasto.
    const recipientIds = rows.map((row) => row.userId);
    after(() => sendPushToUsers(recipientIds, { title: notif.title, body: notif.body, url: urlForType(notif.type) }));
  }
}
