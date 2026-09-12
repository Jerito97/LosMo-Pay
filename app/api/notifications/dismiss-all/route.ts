import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  await db
    .update(notifications)
    .set({ dismissedAt: new Date() })
    .where(and(eq(notifications.userId, user.id), isNull(notifications.dismissedAt)));

  return NextResponse.json({ ok: true });
}
