import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers, getExpensesWithParticipants, getPayments } from "@/lib/data/queries";
import { ledgerBetween } from "@/lib/balances";
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
    name: u.username,
    isMe: u.id === me.id,
    meta: `cumple el ${formatBirthdayFull(u.birthday)}`,
    // Saldo entre vos y esta persona puntual (no el saldo global de esa
    // persona contra todo el grupo): es lo que hace falta para poder separar
    // "quién me debe a mí" de "a quién le debo yo".
    net: ledgerBetween(me.id, u.id, expenses, payments).amount,
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
