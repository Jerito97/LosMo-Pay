import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications, users } from "@/lib/db/schema";
import { ageTurning } from "@/lib/dates";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = new Date();
  const allUsers = await db.select().from(users);

  const birthdayPeople = allUsers.filter((u) => {
    const b = new Date(u.birthday + "T00:00:00Z");
    return b.getUTCMonth() === now.getUTCMonth() && b.getUTCDate() === now.getUTCDate();
  });

  if (birthdayPeople.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  let notified = 0;

  for (const person of birthdayPeople) {
    const others = allUsers.filter((u) => u.id !== person.id && u.notifPrefs.cumple !== false);
    if (others.length === 0) continue;

    const alreadyNotified = await db
      .select({ userId: notifications.userId })
      .from(notifications)
      .where(
        and(
          eq(notifications.type, "birthday"),
          eq(notifications.targetId, person.id),
          gte(notifications.createdAt, startOfDay),
        ),
      );
    const alreadyNotifiedIds = new Set(alreadyNotified.map((n) => n.userId));

    const toInsert = others
      .filter((u) => !alreadyNotifiedIds.has(u.id))
      .map((u) => ({
        userId: u.id,
        type: "birthday" as const,
        title: `Hoy cumple ${person.username}`,
        body: `${ageTurning(person.birthday, now)} años. Caé con el saludo antes de que se haga tarde.`,
        targetType: "user" as const,
        targetId: person.id,
      }));

    if (toInsert.length) {
      await db.insert(notifications).values(toInsert);
      notified += toInsert.length;
    }
  }

  return NextResponse.json({ notified });
}

// Evita cachear la respuesta del cron.
export const dynamic = "force-dynamic";
