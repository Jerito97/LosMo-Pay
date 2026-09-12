import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { usernameSchema } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("username") ?? "";
  const parsed = usernameSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ exists: false });
  }

  const existing = await db.query.users.findFirst({
    where: sql`lower(${users.username}) = lower(${parsed.data})`,
    columns: { id: true },
  });

  return NextResponse.json({ exists: !!existing });
}
