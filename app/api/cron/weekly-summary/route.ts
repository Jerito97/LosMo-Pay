import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { computeBalances, netTotal, shareOf } from "@/lib/balances";
import { startOfWeekArgentina } from "@/lib/dates";
import { money, signedMoney } from "@/lib/format";
import { notifyUsers } from "@/lib/notify";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { dateString: startOfWeek, instant: startOfWeekInstant } = startOfWeekArgentina();
  const [allUsers, allExpenses, allPayments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const weekExpenses = allExpenses.filter((e) => e.expenseDate >= startOfWeek);

  // Idempotencia: si el cron ya corrió esta semana (re-disparo manual, etc.),
  // no duplicar el resumen de quien ya lo recibió.
  const alreadyNotified = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(
      and(eq(notifications.type, "weekly_summary"), gte(notifications.createdAt, startOfWeekInstant)),
    );
  const alreadyNotifiedIds = new Set(alreadyNotified.map((n) => n.userId));

  let notified = 0;
  for (const user of allUsers) {
    if (alreadyNotifiedIds.has(user.id)) continue;

    const net = netTotal(computeBalances(user.id, allExpenses, allPayments));
    const myWeekExpenses = weekExpenses.filter((e) => e.participantIds.includes(user.id));
    const myWeekShare = myWeekExpenses.reduce((sum, e) => sum + shareOf(e), 0);

    const activity =
      weekExpenses.length === 0
        ? "Sin gastos nuevos esta semana"
        : weekExpenses.length === 1
          ? "1 gasto cargado esta semana"
          : `${weekExpenses.length} gastos cargados esta semana`;
    const activityWithShare = activity + (myWeekShare > 0 ? ` · tu parte ${money(myWeekShare)}` : "");

    await notifyUsers([user.id], {
      type: "weekly_summary",
      title: "Resumen semanal",
      body: `${activityWithShare} · Saldo neto: ${net === 0 ? "al día" : signedMoney(net)}`,
      targetType: "user",
      targetId: user.id,
    });
    notified++;
  }

  return NextResponse.json({ notified });
}

// Evita cachear la respuesta del cron.
export const dynamic = "force-dynamic";
