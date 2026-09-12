"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { payments } from "@/lib/db/schema";
import { requireCurrentUser } from "@/lib/auth/session";
import { notifyUsers } from "@/lib/notify";
import { money } from "@/lib/format";

export async function createPayment(input: {
  counterpartyId: string;
  amount: number;
  direction: "pay" | "collect";
}) {
  const me = await requireCurrentUser();
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("El monto tiene que ser mayor a cero");
  }

  const fromUserId = input.direction === "pay" ? me.id : input.counterpartyId;
  const toUserId = input.direction === "pay" ? input.counterpartyId : me.id;

  await db.insert(payments).values({ fromUserId, toUserId, amount: input.amount });

  await notifyUsers([input.counterpartyId], {
    type: "payment_received",
    title:
      input.direction === "pay"
        ? `${me.username} te pagó`
        : `${me.username} marcó tu pago como recibido`,
    body: money(input.amount),
    targetType: "user",
    targetId: me.id,
  });

  revalidatePath("/personas");
  revalidatePath("/gastos");
  revalidatePath("/inicio");
}
