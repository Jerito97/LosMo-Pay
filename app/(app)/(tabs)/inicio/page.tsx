import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { computeBalances, netTotal } from "@/lib/balances";
import { daysUntilNextBirthday, ageTurning } from "@/lib/dates";
import { formatBirthdayShort, initials, signedMoney, todayLabel } from "@/lib/format";
import { InicioHeaderActions } from "@/components/inicio/InicioHeaderActions";
import { InicioFeed } from "@/components/inicio/InicioFeed";
import { WineCard } from "@/components/ui/Card";

export default async function InicioPage() {
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const balance = computeBalances(me.id, expenses, payments);
  const net = netTotal(balance);

  const withDays = users.map((u) => ({
    ...u,
    days: daysUntilNextBirthday(u.birthday),
    age: ageTurning(u.birthday),
  }));

  const today = withDays.find((u) => u.days === 0);
  const feed = withDays
    .filter((u) => u.days > 0)
    .sort((a, b) => a.days - b.days)
    .map((u) => ({
      id: u.id,
      name: u.id === me.id ? `${u.username} (vos)` : u.username,
      days: u.days,
      dateShort: formatBirthdayShort(u.birthday),
      ageLabel: `cumple ${u.age}`,
    }));

  return (
    <div className="px-[18px] pt-14 pb-[100px]">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-[0.18em] text-accent uppercase">
            {todayLabel()}
          </div>
          <h1 className="mt-2.5 font-[family-name:var(--font-display)] text-[36px] leading-[1.02] font-normal">
            Hola, {me.username}.
          </h1>
        </div>
        <InicioHeaderActions
          meId={me.id}
          username={me.username}
          alias={me.alias}
          birthdayLabel={me.birthday}
        />
      </div>

      <Link href="/gastos" className="mt-4.5 block">
        <WineCard>
          <span className="flex items-baseline justify-between gap-2.5">
            <span className="text-[10px] font-bold tracking-[0.18em] text-onwine3 uppercase">
              Tu saldo
            </span>
            <span className="text-[11.5px] text-onwine2">
              {net > 0 ? "a favor tuyo" : net < 0 ? "en contra" : "sin deudas abiertas"}
            </span>
          </span>
          <span className="mt-1.5 flex items-end justify-between gap-2.5">
            <span className="font-[family-name:var(--font-display)] text-[46px] leading-[0.95]">
              {net === 0 ? "Al día" : signedMoney(net)}
            </span>
            <span className="pb-1.5 text-[16px] text-onwine3">→</span>
          </span>
        </WineCard>
      </Link>

      {today && (
        <Link
          href="/fechas"
          className="mt-2.5 flex items-center gap-3.5 rounded-[18px] bg-rose p-3.5"
        >
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-wine text-[14px] font-bold text-onwine">
            {initials(today.username)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold tracking-[0.18em] text-white uppercase">
              Hoy cumple
            </span>
            <span className="mt-1 block font-[family-name:var(--font-display)] text-[23px] leading-tight text-white">
              {today.username} · cumple {today.age}
            </span>
          </span>
          <span className="flex-none text-[16px] text-white">→</span>
        </Link>
      )}

      <InicioFeed people={feed} />
    </div>
  );
}
