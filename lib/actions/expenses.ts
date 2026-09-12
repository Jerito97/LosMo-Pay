"use server";

import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
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
