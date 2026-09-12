import { desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { expenseParticipants, expenses, payments, users } from "@/lib/db/schema";
import type { ExpenseForLedger, PaymentForLedger } from "@/lib/balances";

export async function getAllUsers() {
  return db.select().from(users).orderBy(users.createdAt);
}

export async function getExpensesWithParticipants(): Promise<ExpenseForLedger[]> {
  const [expenseRows, participantRows] = await Promise.all([
    db.select().from(expenses).orderBy(desc(expenses.expenseDate), desc(expenses.createdAt)),
    db.select().from(expenseParticipants),
  ]);

  const byExpense = new Map<string, string[]>();
  for (const row of participantRows) {
    const list = byExpense.get(row.expenseId) ?? [];
    list.push(row.userId);
    byExpense.set(row.expenseId, list);
  }

  return expenseRows.map((expense) => ({
    id: expense.id,
    description: expense.description,
    amount: expense.amount,
    payerId: expense.payerId,
    createdBy: expense.createdBy,
    updatedBy: expense.updatedBy,
    updatedAt: expense.updatedAt ? expense.updatedAt.toISOString() : null,
    participantIds: byExpense.get(expense.id) ?? [],
    expenseDate: expense.expenseDate,
  }));
}

export async function getPayments(): Promise<PaymentForLedger[]> {
  const rows = await db.select().from(payments).orderBy(desc(payments.createdAt));
  return rows.map((payment) => ({
    id: payment.id,
    fromUserId: payment.fromUserId,
    toUserId: payment.toUserId,
    amount: payment.amount,
    createdAt: payment.createdAt.toISOString(),
    recordedBy: payment.recordedBy,
  }));
}
