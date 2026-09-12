"use server";

import { randomUUID } from "crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { expenseParticipants, expenses, users } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { notifyUsers } from "@/lib/notify";
import { money } from "@/lib/format";
import { todayDateStringArgentina } from "@/lib/dates";

export async function createExpense(input: {
  description: string;
  amount: number;
  payerId: string;
  participantIds: string[];
}) {
  await requireCurrentUser();

  const description = input.description.trim();
  if (!description) throw new Error("Falta la descripción");
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("El monto tiene que ser mayor a cero");
  }

  const participantIds = [...new Set(input.participantIds)];
  if (!participantIds.includes(input.payerId)) participantIds.push(input.payerId);
  if (participantIds.length === 0) throw new Error("Elegí al menos una persona");

  const expenseId = randomUUID();

  await db.batch([
    db.insert(expenses).values({
      id: expenseId,
      description,
      amount: input.amount,
      payerId: input.payerId,
      createdBy: input.payerId,
      // El default de la columna es now() de Postgres (UTC): a la noche en
      // Argentina eso ya cae en el día siguiente. Fijamos la fecha real acá.
      expenseDate: todayDateStringArgentina(),
    }),
    db.insert(expenseParticipants).values(
      participantIds.map((userId) => ({ expenseId, userId })),
    ),
  ]);

  const payer = await db.query.users.findFirst({
    where: eq(users.id, input.payerId),
    columns: { username: true },
  });
  const others = participantIds.filter((id) => id !== input.payerId);
  if (payer) {
    await notifyUsers(others, {
      type: "expense_added",
      title: `${payer.username} cargó un gasto`,
      body: `"${description}" · ${money(input.amount)} entre ${participantIds.length}`,
      targetType: "expense",
      targetId: expenseId,
    });
  }

  revalidatePath("/gastos");
  revalidatePath("/inicio");
  revalidatePath("/personas");
}

export async function deleteExpense(expenseId: string) {
  await requireCurrentUser();
  await db.delete(expenses).where(eq(expenses.id, expenseId));
  revalidatePath("/gastos");
  revalidatePath("/inicio");
  revalidatePath("/personas");
}

async function getExpenseContext(expenseId: string) {
  const [expense, participants] = await Promise.all([
    db.query.expenses.findFirst({ where: eq(expenses.id, expenseId) }),
    db
      .select({ userId: expenseParticipants.userId })
      .from(expenseParticipants)
      .where(eq(expenseParticipants.expenseId, expenseId)),
  ]);
  if (!expense) throw new Error("El gasto no existe");
  return { expense, participantIds: participants.map((p) => p.userId) };
}

/** Cualquiera puede sumarse a un gasto, aunque no lo haya cargado quien pagó. */
export async function joinExpense(expenseId: string) {
  const me = await requireCurrentUser();
  const { expense, participantIds } = await getExpenseContext(expenseId);
  if (participantIds.includes(me.id)) return;

  await db.insert(expenseParticipants).values({ expenseId, userId: me.id }).onConflictDoNothing();

  await notifyUsers(participantIds, {
    type: "expense_added",
    title: `${me.username} se sumó a un gasto`,
    body: `"${expense.description}" · ahora se reparte entre ${participantIds.length + 1}`,
    targetType: "expense",
    targetId: expenseId,
  });

  revalidatePath(`/gastos/${expenseId}`);
  revalidatePath("/gastos");
  revalidatePath("/inicio");
  revalidatePath("/personas");
}

/** Sacarte de un gasto en el que sentís que no participás. */
export async function leaveExpense(expenseId: string) {
  const me = await requireCurrentUser();
  const { expense, participantIds } = await getExpenseContext(expenseId);
  if (!participantIds.includes(me.id)) return;
  if (participantIds.length <= 1) {
    throw new Error("Sos el único participante: no te podés sacar de este gasto");
  }

  await db
    .delete(expenseParticipants)
    .where(and(eq(expenseParticipants.expenseId, expenseId), eq(expenseParticipants.userId, me.id)));

  const remaining = participantIds.filter((id) => id !== me.id);
  await notifyUsers(remaining, {
    type: "expense_added",
    title: `${me.username} se sacó de un gasto`,
    body: `"${expense.description}" · ahora se reparte entre ${remaining.length}`,
    targetType: "expense",
    targetId: expenseId,
  });

  revalidatePath(`/gastos/${expenseId}`);
  revalidatePath("/gastos");
  revalidatePath("/inicio");
  revalidatePath("/personas");
}
