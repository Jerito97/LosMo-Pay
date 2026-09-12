"use server";

import { eq } from "drizzle-orm";
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

  await db.insert(payments).values({ fromUserId, toUserId, amount: input.amount, recordedBy: me.id });

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

/** Deshacer un pago mal cargado: solo quien lo registró, o un admin. */
export async function deletePayment(paymentId: string) {
  const me = await requireCurrentUser();
  const payment = await db.query.payments.findFirst({ where: eq(payments.id, paymentId) });
  if (!payment) throw new Error("El pago no existe");
  if (!(me.isAdmin || payment.recordedBy === me.id)) {
    throw new Error("Solo quien registró este pago (o un admin) lo puede eliminar");
  }

  await db.delete(payments).where(eq(payments.id, paymentId));

  const other = payment.fromUserId === me.id ? payment.toUserId : payment.fromUserId;
  if (other !== me.id) {
    await notifyUsers([other], {
      type: "payment_received",
      title: `${me.username} deshizo un pago`,
      body: money(payment.amount),
      targetType: "user",
      targetId: me.id,
    });
  }

  revalidatePath("/personas");
  revalidatePath("/gastos");
  revalidatePath("/inicio");
}
