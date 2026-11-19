"use server";

import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { expenseParticipants, expenses, notifications, payments, users } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/validation";

/**
 * Borrado total: solo un admin, y no a sí mismo. Se lleva puesto todo lo que
 * tenga que ver con esa persona -gastos que pagó o cargó (enteros, aunque
 * otros participaran), pagos que hizo o recibió, y su lugar en gastos
 * ajenos- porque dejar referencias sueltas a un usuario que ya no existe
 * rompería el historial de los demás.
 */
export async function deleteUser(userId: string) {
  const me = await requireCurrentUser();
  if (!me.isAdmin) throw new Error("Solo un admin puede eliminar personas");
  if (userId === me.id) throw new Error("No te podés eliminar a vos mismo");

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) return;

  // Gastos que esta persona pagó o cargó: se borran enteros. El cascade de
  // expense_participants.expense_id se lleva puestos a los demás participantes
  // de esos gastos puntuales.
  await db.delete(expenses).where(or(eq(expenses.payerId, userId), eq(expenses.createdBy, userId)));

  // Otros gastos donde solo participaba: la sacamos y, si eso deja el gasto
  // sin nadie, se borra entero.
  const remainingParticipations = await db
    .select({ expenseId: expenseParticipants.expenseId })
    .from(expenseParticipants)
    .where(eq(expenseParticipants.userId, userId));

  if (remainingParticipations.length) {
    await db.delete(expenseParticipants).where(eq(expenseParticipants.userId, userId));

    for (const { expenseId } of remainingParticipations) {
      const remaining = await db
        .select({ userId: expenseParticipants.userId })
        .from(expenseParticipants)
        .where(eq(expenseParticipants.expenseId, expenseId));
      if (remaining.length === 0) {
        await db.delete(expenses).where(eq(expenses.id, expenseId));
      }
    }
  }

  // Gastos ajenos que esta persona haya editado: no se borran, solo se
  // limpia la referencia (la columna es nullable).
  await db.update(expenses).set({ updatedBy: null }).where(eq(expenses.updatedBy, userId));

  // Pagos donde esta persona es parte (hizo o recibió): se borran enteros.
  await db.delete(payments).where(or(eq(payments.fromUserId, userId), eq(payments.toUserId, userId)));

  // Pagos ajenos que haya registrado: se limpia la referencia.
  await db.update(payments).set({ recordedBy: null }).where(eq(payments.recordedBy, userId));

  // Sus propias notificaciones.
  await db.delete(notifications).where(eq(notifications.userId, userId));

  await db.delete(users).where(eq(users.id, userId));

  revalidatePath("/personas");
  revalidatePath("/gastos");
  revalidatePath("/inicio");
  revalidatePath("/fechas");
}

/** Dar o sacar el rol de admin a otra persona. Un admin no se puede tocar a sí mismo acá. */
export async function setAdmin(userId: string, isAdmin: boolean) {
  const me = await requireCurrentUser();
  if (!me.isAdmin) throw new Error("Solo un admin puede dar o sacar el rol de admin");
  if (userId === me.id) throw new Error("No te podés cambiar el rol de admin a vos mismo");

  await db.update(users).set({ isAdmin }).where(eq(users.id, userId));

  revalidatePath("/personas");
  revalidatePath(`/personas/${userId}`);
}

/**
 * Resetear la contraseña de otra persona. Reemplaza el flow de "olvidé mi
 * contraseña" por mail para el grupo: el club es chico y de confianza, así
 * que un admin le puede poner una contraseña nueva en persona (o por
 * WhatsApp) en vez de depender de que el mail de recuperación le llegue.
 */
export async function adminResetPassword(userId: string, newPassword: string) {
  const me = await requireCurrentUser();
  if (!me.isAdmin) throw new Error("Solo un admin puede cambiar la contraseña de otra persona");

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Contraseña inválida");
  }

  const passwordHash = await hashPassword(parsed.data);
  await db
    .update(users)
    .set({ passwordHash, resetTokenHash: null, resetTokenExpiresAt: null })
    .where(eq(users.id, userId));

  revalidatePath(`/personas/${userId}`);
}
