import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { computeBalances, myEffect, netTotal } from "@/lib/balances";
import { relativeDateLabel } from "@/lib/format";
import { GastosBalanceCard } from "@/components/gastos/GastosBalanceCard";
import { GastosExpenseList } from "@/components/gastos/GastosExpenseList";
import { GastosFabTrigger } from "@/components/gastos/GastosFabTrigger";

export default async function GastosPage() {
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const usersById = new Map(users.map((u) => [u.id, u]));
  const balance = computeBalances(me.id, expenses, payments);
  const net = netTotal(balance);

  const bars = Object.entries(balance)
    .map(([userId, amount]) => ({
      userId,
      name: usersById.get(userId)?.username ?? "?",
      amount,
    }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5);

  const rows = expenses.map((expense) => {
    const payer = usersById.get(expense.payerId);
    return {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      payerId: expense.payerId,
      payerName: payer?.username ?? "?",
      sub:
        (expense.payerId === me.id ? "pagaste vos" : `pagó ${payer?.username ?? "?"}`) +
        ` · entre ${expense.participantIds.length}`,
      dateLabel: relativeDateLabel(expense.expenseDate),
      effect: myEffect(expense, me.id),
    };
  });

  return (
    <div className="px-[18px] pt-14 pb-[100px] [animation:sIn_.26s_ease-out]">
      <h1 className="mx-1 font-[family-name:var(--font-display)] text-[40px] leading-none font-normal">
        Gastos
      </h1>

      <div className="mt-4">
        <GastosBalanceCard net={net} bars={bars} />
      </div>

      <GastosExpenseList rows={rows} />

      <GastosFabTrigger
        meId={me.id}
        users={users.map((u) => ({ id: u.id, username: u.username }))}
      />
    </div>
  );
}
