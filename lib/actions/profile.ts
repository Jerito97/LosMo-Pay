"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import {
  aliasSchema,
  birthdaySchema,
  emailSchema,
  fullNameSchema,
  passwordSchema,
  usernameSchema,
} from "@/lib/auth/validation";

export async function setTheme(theme: "claro" | "oscuro" | "sistema") {
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

/** Editar mi propio perfil: nombre completo, apodo, alias, cumpleaños, mail y, si se completa, una contraseña nueva. */
export async function updateProfile(input: {
  fullName: string;
  username: string;
  alias: string;
  birthday: string;
  newEmail?: string;
  newPassword?: string;
}) {
  const me = await requireCurrentUser();

  const fullName = fullNameSchema.safeParse(input.fullName);
  if (!fullName.success) throw new Error(fullName.error.issues[0].message);
  const username = usernameSchema.safeParse(input.username);
  if (!username.success) throw new Error(username.error.issues[0].message);
  const alias = aliasSchema.safeParse(input.alias);
  if (!alias.success) throw new Error(alias.error.issues[0].message);
  const birthday = birthdaySchema.safeParse(input.birthday);
  if (!birthday.success) throw new Error(birthday.error.issues[0].message);

  let email: string | undefined;
  if (input.newEmail) {
    const parsedEmail = emailSchema.safeParse(input.newEmail);
    if (!parsedEmail.success) throw new Error(parsedEmail.error.issues[0].message);
    email = parsedEmail.data;
  }

  let passwordHash: string | undefined;
  if (input.newPassword) {
    const parsedPassword = passwordSchema.safeParse(input.newPassword);
    if (!parsedPassword.success) throw new Error(parsedPassword.error.issues[0].message);
    passwordHash = await hashPassword(parsedPassword.data);
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
  if (email) {
    const emailTaken = await db.query.users.findFirst({
      where: and(sql`lower(${users.email}) = lower(${email})`, ne(users.id, me.id)),
      columns: { id: true },
    });
    if (emailTaken) throw new Error("Ese mail ya está en uso por otra persona del grupo");
  }

  try {
    await db
      .update(users)
      .set({
        fullName: fullName.data,
        username: username.data,
        alias: alias.data,
        birthday: birthday.data,
        ...(email ? { email } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      })
      .where(eq(users.id, me.id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new Error("Ese nombre, alias o mail se acaba de ocupar. Probá con otro.");
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
