import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { ledgerBetween, myEffect, shareOf } from "@/lib/balances";
import { isZeroMoney, money, relativeDateLabel, timeAgo } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import { Card, WineCard } from "@/components/ui/Card";
import { DeleteExpenseButton } from "@/components/gastos/DeleteExpenseButton";
import { JoinLeaveExpenseButton } from "@/components/gastos/JoinLeaveExpenseButton";
import { EditParticipantsButton } from "@/components/gastos/EditParticipantsButton";
import { EditExpenseButton } from "@/components/gastos/EditExpenseButton";
import { ShareExpenseButton } from "@/components/gastos/ShareExpenseButton";
import { PayMyShareButton } from "@/components/gastos/PayMyShareButton";
import { CollectShareButton } from "@/components/gastos/CollectShareButton";
import { InviteJoinPrompt } from "@/components/gastos/InviteJoinPrompt";

export default async function GastoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const { id } = await params;
  const { invite } = await searchParams;
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const expense = expenses.find((e) => e.id === id);
  if (!expense) notFound();

  const usersById = new Map(users.map((u) => [u.id, u]));
  const payer = usersById.get(expense.payerId);
  const share = shareOf(expense);
  const effect = myEffect(expense, me.id);
  const iParticipate = expense.participantIds.includes(me.id);
  const canManage = me.isAdmin || expense.createdBy === me.id;
  const iAmPayer = expense.payerId === me.id;
  const editor = expense.updatedBy ? usersById.get(expense.updatedBy) : null;

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
      {expense.updatedAt && (
        <div className="mx-1 mt-0.5 text-[11.5px] text-faint">
          Editado por {expense.updatedBy === me.id ? "vos" : (editor?.username ?? "?")}{" "}
          {timeAgo(new Date(expense.updatedAt))}
        </div>
      )}

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

      {effect < 0 && expense.payerId !== me.id && (
        <div className="mt-3.5">
          <PayMyShareButton payerId={expense.payerId} amount={Math.abs(effect)} />
        </div>
      )}

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
          const owesMe =
            iAmPayer &&
            !isPayer &&
            !isZeroMoney(ledgerBetween(me.id, participantId, expenses, payments).amount);
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
              {owesMe && <CollectShareButton participantId={participantId} amount={share} />}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {canManage ? (
          <>
            <EditExpenseButton
              expenseId={expense.id}
              currentDescription={expense.description}
              currentAmount={expense.amount}
            />
            <EditParticipantsButton
              expenseId={expense.id}
              meId={me.id}
              users={users.map((u) => ({ id: u.id, username: u.username }))}
              currentParticipantIds={expense.participantIds}
            />
          </>
        ) : (
          <JoinLeaveExpenseButton expenseId={expense.id} isParticipant={iParticipate} />
        )}
        <ShareExpenseButton
          expenseId={expense.id}
          description={expense.description}
          amount={expense.amount}
        />
        {canManage && <DeleteExpenseButton expenseId={expense.id} />}
      </div>

      {invite === "1" && !iParticipate && (
        <InviteJoinPrompt
          expenseId={expense.id}
          description={expense.description}
          amount={expense.amount}
        />
      )}
    </div>
  );
}
