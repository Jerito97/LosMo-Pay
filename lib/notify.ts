import { inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications, users, type NewNotification } from "@/lib/db/schema";

type NotifType = NewNotification["type"];

function prefKeyForType(type: NotifType): "cumple" | "gasto" | "resumen" {
  if (type === "birthday") return "cumple";
  if (type === "weekly_summary") return "resumen";
  return "gasto";
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
    .filter((user) => user.notifPrefs[prefKey] !== false)
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
  }
}
