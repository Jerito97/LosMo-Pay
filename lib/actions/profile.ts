"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";

export async function setTheme(theme: "claro" | "oscuro") {
  const me = await requireCurrentUser();
  await db.update(users).set({ themePref: theme }).where(eq(users.id, me.id));
  revalidatePath("/", "layout");
}

export async function toggleNotifPref(key: "cumple" | "gasto" | "resumen") {
  const me = await requireCurrentUser();
  const next = { ...me.notifPrefs, [key]: !me.notifPrefs[key] };
  await db.update(users).set({ notifPrefs: next }).where(eq(users.id, me.id));
  revalidatePath("/config");
}
