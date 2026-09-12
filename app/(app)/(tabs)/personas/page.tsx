import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { computeBalances, netTotal } from "@/lib/balances";
import { formatBirthdayFull } from "@/lib/format";
import { PersonasClient } from "@/components/personas/PersonasClient";

export default async function PersonasPage() {
  const me = await requireCurrentUser();
  const [users, expenses, payments] = await Promise.all([
    getAllUsers(),
    getExpensesWithParticipants(),
    getPayments(),
  ]);

  const people = users.map((u) => ({
    id: u.id,
    name: u.id === me.id ? `${u.username} (vos)` : u.username,
    meta: `cumple el ${formatBirthdayFull(u.birthday)}`,
    // Saldo neto de esta persona contra TODO el grupo (no relativo a quien mira
    // la pantalla): lo mismo que cada uno ve como "Tu saldo neto" en Gastos.
    net: netTotal(computeBalances(u.id, expenses, payments)),
  }));

  return (
    <div className="px-[18px] pt-14 pb-[100px]">
      <h1 className="mx-1 font-[family-name:var(--font-display)] text-[40px] leading-none font-normal">
        Personas
      </h1>
      <div className="mx-1 mt-2 text-[12.5px] text-muted">{users.length} personas en el grupo</div>
      <PersonasClient people={people} />
    </div>
  );
}
