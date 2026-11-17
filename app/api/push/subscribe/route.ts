import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pushSubscriptions } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const me = await requireCurrentUser();
  const body = await request.json().catch(() => null);
  const endpoint: unknown = body?.endpoint;
  const p256dh: unknown = body?.keys?.p256dh;
  const auth: unknown = body?.keys?.auth;
  if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ error: "Suscripción inválida" }, { status: 400 });
  }

  await db
    .insert(pushSubscriptions)
    .values({ userId: me.id, endpoint, p256dh, auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: me.id, p256dh, auth },
    });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  await requireCurrentUser();
  const body = await request.json().catch(() => null);
  const endpoint: unknown = body?.endpoint;
  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Falta el endpoint" }, { status: 400 });
  }

  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  return NextResponse.json({ ok: true });
}
