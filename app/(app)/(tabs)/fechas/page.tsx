import { requireCurrentUser } from "@/lib/auth/session";
import { getAllUsers } from "@/lib/data/queries";
import { daysUntilNextBirthday, ageTurning } from "@/lib/dates";
import { formatBirthdayShort } from "@/lib/format";
import { FechasClient } from "@/components/fechas/FechasClient";

export default async function FechasPage() {
  const me = await requireCurrentUser();
  const users = await getAllUsers();

  const people = users.map((u) => {
    const d = new Date(u.birthday + "T00:00:00Z");
    return {
      id: u.id,
      name: u.username,
      isMe: u.id === me.id,
      days: daysUntilNextBirthday(u.birthday),
      dateShort: formatBirthdayShort(u.birthday),
      ageLabel: `cumple ${ageTurning(u.birthday)}`,
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  });

  return <FechasClient people={people} />;
}
