import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { ledgerBetween, shareOf } from "@/lib/balances";
import { nowInArgentina } from "@/lib/dates";
import { money } from "@/lib/format";
import { notifyUsers } from "@/lib/notify";

function daysSince(dateStr: string, todayUTC: number): number {
  const d = new Date(dateStr + "T00:00:00Z");
  const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((todayUTC - dUTC) / 86_400_000);
}

/**
 * Recordatorio de pago: a los 3 días de cargado un gasto, y cada 3 días de
 * ahí en más, le avisamos a quien todavía le debe algo (en total) a quien
 * pagó -no hay un "pagado" por gasto puntual en el modelo de datos, así que
 * usamos el saldo neto entre esas dos personas como señal de si ya se puso
 * al día.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const now = nowInArgentina();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  // now está desplazado a hora argentina; para volver a un instante UTC real
  // correspondiente a la medianoche de Argentina, hay que sumarle de nuevo
  // las 3 horas del desfasaje (ver nowInArgentina).
  const startOfDay = new Date(todayUTC + 3 * 60 * 60 * 1000);

  const [allUsers, allExpenses, allPayments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);
  const usersById = new Map(allUsers.map((u) => [u.id, u]));

  const todaysReminders = await db
    .select({ userId: notifications.userId, targetId: notifications.targetId })
    .from(notifications)
    .where(and(eq(notifications.type, "payment_reminder"), gte(notifications.createdAt, startOfDay)));
  const alreadyRemindedKeys = new Set(todaysReminders.map((r) => `${r.userId}:${r.targetId}`));

  let notified = 0;

  for (const expense of allExpenses) {
    const days = daysSince(expense.expenseDate, todayUTC);
    if (days < 3 || days % 3 !== 0) continue;

    const payer = usersById.get(expense.payerId);
    if (!payer) continue;
    const share = shareOf(expense);

    for (const participantId of expense.participantIds) {
      if (participantId === expense.payerId) continue;
      if (alreadyRemindedKeys.has(`${participantId}:${expense.id}`)) continue;

      const { amount } = ledgerBetween(expense.payerId, participantId, allExpenses, allPayments);
      if (amount <= 0) continue; // ya está al día (o le deben a él/ella)

      await notifyUsers([participantId], {
        type: "payment_reminder",
        title: `Debés tu parte de "${expense.description}"`,
        body: `${money(share)} a ${payer.username} · hace ${days} días`,
        targetType: "expense",
        targetId: expense.id,
      });
      notified++;
    }
  }

  return NextResponse.json({ notified });
}

// Evita cachear la respuesta del cron.
export const dynamic = "force-dynamic";
