"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { hashPin } from "@/lib/auth/pin";
import { aliasSchema, birthdaySchema, pinSchema, usernameSchema } from "@/lib/auth/validation";

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

/** Editar mi propio perfil: nombre, alias, cumpleaños y, si se completa, un PIN nuevo. */
export async function updateProfile(input: {
  username: string;
  alias: string;
  birthday: string;
  newPin?: string;
}) {
  const me = await requireCurrentUser();

  const username = usernameSchema.safeParse(input.username);
  if (!username.success) throw new Error(username.error.issues[0].message);
  const alias = aliasSchema.safeParse(input.alias);
  if (!alias.success) throw new Error(alias.error.issues[0].message);
  const birthday = birthdaySchema.safeParse(input.birthday);
  if (!birthday.success) throw new Error(birthday.error.issues[0].message);

  let pinHash: string | undefined;
  if (input.newPin) {
    const newPin = pinSchema.safeParse(input.newPin);
    if (!newPin.success) throw new Error(newPin.error.issues[0].message);
    pinHash = await hashPin(newPin.data);
  }

  const usernameTaken = await db.query.users.findFirst({
    where: and(sql`lower(${users.username}) = lower(${username.data})`, ne(users.id, me.id)),
    columns: { id: true },
  });
  if (usernameTaken) throw new Error("Ese nombre ya está en uso por otra persona del grupo");
  const aliasTaken = await db.query.users.findFirst({
    where: and(sql`lower(${users.alias}) = lower(${alias.data})`, ne(users.id, me.id)),
    columns: { id: true },
  });
  if (aliasTaken) throw new Error("Ese alias ya está en uso por otra persona del grupo");

  try {
    await db
      .update(users)
      .set({
        username: username.data,
        alias: alias.data,
        birthday: birthday.data,
        ...(pinHash ? { pinHash } : {}),
      })
      .where(eq(users.id, me.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("Ese nombre o alias se acaba de ocupar. Probá con otro.");
    }
    throw error;
  }

  revalidatePath("/", "layout");
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}
