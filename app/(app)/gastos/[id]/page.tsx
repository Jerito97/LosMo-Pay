import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants } from "@/lib/data/queries";
import { myEffect, shareOf } from "@/lib/balances";
import { money, relativeDateLabel } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Card, WineCard } from "@/components/ui/Card";
import { DeleteExpenseButton } from "@/components/gastos/DeleteExpenseButton";

export default async function GastoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireCurrentUser();
  const [users, expenses] = await Promise.all([getAllUsers(), getExpensesWithParticipants()]);

  const expense = expenses.find((e) => e.id === id);
  if (!expense) notFound();

  const usersById = new Map(users.map((u) => [u.id, u]));
  const payer = usersById.get(expense.payerId);
  const share = shareOf(expense);
  const effect = myEffect(expense, me.id);
  const iParticipate = expense.participantIds.includes(me.id);

  return (
    <div className="px-[18px] pt-14 pb-8">
      <Link
        href="/gastos"
        className="ml-1 text-[11px] font-bold tracking-[0.14em] text-accent uppercase"
      >
        ← Gastos
      </Link>
      <h1 className="mx-1 mt-3.5 font-[family-name:var(--font-display)] text-[32px] leading-tight font-normal">
        {expense.description}
      </h1>
      <div className="mx-1 mt-2 text-[12.5px] text-muted">
        {relativeDateLabel(expense.expenseDate)} ·{" "}
        {expense.payerId === me.id ? "lo pagaste vos" : `lo pagó ${payer?.username ?? "?"}`}
      </div>

      <WineCard className="mt-4">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="text-[10px] font-bold tracking-[0.18em] text-onwine3 uppercase">
            Monto
          </span>
          <span className="text-[11.5px] text-onwine2">
            tu parte {iParticipate ? money(share) : "no participás"}
          </span>
        </div>
        <div className="mt-1.5 font-[family-name:var(--font-display)] text-[44px] leading-[0.95]">
          {money(expense.amount)}
        </div>
      </WineCard>

      <Card className="mt-3.5">
        <div className="text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
          {effect > 0 ? "Te deben por este gasto" : effect < 0 ? "Debés por este gasto" : "No te afecta"}
        </div>
        <div
          className="mt-1.5 font-[family-name:var(--font-display)] text-[30px] leading-none"
          style={{ color: effect < 0 ? "var(--rose)" : "var(--ink)" }}
        >
          {effect === 0 ? "—" : money(effect)}
        </div>
      </Card>

      <div className="mt-6 flex items-baseline justify-between gap-2.5 px-1">
        <span className="font-[family-name:var(--font-display)] text-[23px]">Participan</span>
        <span className="text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
          {expense.participantIds.length} personas
        </span>
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        {expense.participantIds.map((participantId) => {
          const user = usersById.get(participantId);
          const isPayer = participantId === expense.payerId;
          return (
            <div
              key={participantId}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
            >
              <Avatar name={user?.username ?? "?"} userId={participantId} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-semibold">
                  {participantId === me.id ? `${user?.username} (vos)` : user?.username}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-muted">
                  {isPayer ? "puso el total" : "le corresponde"}
                </span>
              </span>
              <span
                className="flex-none text-[15px] font-semibold"
                style={{ color: isPayer ? "var(--brand-ink)" : "var(--ink)" }}
              >
                {money(isPayer ? expense.amount : share)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <DeleteExpenseButton expenseId={expense.id} />
      </div>
    </div>
  );
}
