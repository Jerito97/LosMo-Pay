import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { ledgerBetween } from "@/lib/balances";
import { daysUntilNextBirthday } from "@/lib/dates";
import { formatBirthdayFull, initials, money, signedMoney } from "@/lib/format";
import { AliasCopyCard } from "@/components/personas/AliasCopyCard";
import { PersonaCta } from "@/components/personas/PersonaCta";
import { DeletePaymentButton } from "@/components/personas/DeletePaymentButton";
import { DeletePersonButton } from "@/components/personas/DeletePersonButton";

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const person = users.find((u) => u.id === id);
  if (!person) notFound();

  const { amount, rows } = ledgerBetween(me.id, person.id, expenses, payments);
  const color = amount > 0 ? "var(--brand-ink)" : amount < 0 ? "var(--rose)" : "var(--muted)";
  const days = daysUntilNextBirthday(person.birthday);

  return (
    <div className="px-[18px] pt-14 pb-8">
      <Link
        href="/personas"
        className="ml-1 text-[11px] font-bold tracking-[0.14em] text-accent uppercase"
      >
        ← Personas
      </Link>

      <div className="mt-4 flex items-center gap-3.5 rounded-[20px] bg-wine p-5 text-onwine shadow-[0_8px_22px_rgba(43,16,21,0.14)]">
        <span className="flex h-[58px] w-[58px] flex-none items-center justify-center rounded-full bg-onwine text-[21px] font-bold text-wine">
          {initials(person.username)}
        </span>
        <span className="min-w-0">
          <span className="block font-[family-name:var(--font-display)] text-[30px] leading-tight">
            {person.username}
          </span>
          <span className="mt-1 block text-[12px] text-onwine2">
            Cumple el {formatBirthdayFull(person.birthday)} · en {days} días
          </span>
        </span>
      </div>

      <div className="mt-5 px-1 text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
        Alias para transferirle
      </div>
      <AliasCopyCard alias={person.alias} />

      <div className="mt-6 flex items-baseline justify-between gap-2.5 px-1">
        <span className="font-[family-name:var(--font-display)] text-[23px]">Entre ustedes</span>
        <span className="text-[18px] font-semibold" style={{ color }}>
          {amount === 0 ? "al día" : signedMoney(amount)}
        </span>
      </div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        {rows.map((row) => {
          const canUndo =
            row.kind === "payment" && (me.isAdmin || row.recordedBy === me.id);
          return (
            <div
              key={`${row.kind}-${row.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{row.label}</span>
                <span className="mt-0.5 block text-[11.5px] text-muted">{row.direction}</span>
              </span>
              <span className="text-[15px] font-semibold">{money(row.amount)}</span>
              {canUndo && <DeletePaymentButton paymentId={row.id} />}
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="px-1 py-4 text-[13px] text-muted">Sin movimientos entre ustedes.</div>
        )}
      </div>

      {person.id !== me.id && <PersonaCta counterpartyId={person.id} amount={amount} />}

      {me.isAdmin && person.id !== me.id && (
        <div className="mt-4">
          <DeletePersonButton personId={person.id} personName={person.username} />
        </div>
      )}
    </div>
  );
}
