import { NextResponse } from "next/server";
import { and, desc, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const rows = await db.query.notifications.findMany({
    where: and(eq(notifications.userId, user.id), isNull(notifications.dismissedAt)),
    orderBy: desc(notifications.createdAt),
    limit: 50,
  });

  return NextResponse.json({ notifications: rows });
}
