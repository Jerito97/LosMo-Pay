import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { ledgerBetween } from "@/lib/balances";
import { formatBirthdayFull, money } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";

export default async function PersonasPage() {
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  return (
    <div className="px-[18px] pt-14 pb-[100px] [animation:sIn_.26s_ease-out]">
      <h1 className="mx-1 font-[family-name:var(--font-display)] text-[40px] leading-none font-normal">
        Personas
      </h1>
      <div className="mx-1 mt-2 text-[12.5px] text-muted">{users.length} personas en el grupo</div>
      <div className="mt-4 flex flex-col gap-2.5">
        {users.map((u) => {
          const { amount } = ledgerBetween(me.id, u.id, expenses, payments);
          const state = amount > 0 ? "te debe" : amount < 0 ? "le debés" : "al día";
          const color =
            amount > 0 ? "var(--brand-ink)" : amount < 0 ? "var(--rose)" : "var(--faint)";
          return (
            <Link
              key={u.id}
              href={`/personas/${u.id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-3.5 shadow-[0_2px_8px_rgba(43,16,21,0.04)]"
            >
              <Avatar name={u.username} userId={u.id} size={42} />
              <span className="min-w-0 flex-1">
                <span className="block text-[16.5px] font-semibold">
                  {u.id === me.id ? `${u.username} (vos)` : u.username}
                </span>
                <span className="mt-0.5 block text-[12px] text-muted">
                  cumple el {formatBirthdayFull(u.birthday)}
                </span>
              </span>
              <span className="flex-none text-right">
                <span className="block text-[10px] font-bold tracking-[0.14em] text-faint uppercase">
                  {state}
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold" style={{ color }}>
                  {amount === 0 ? "—" : money(amount)}
                </span>
              </span>
              <span className="flex-none text-[15px] text-faint">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
