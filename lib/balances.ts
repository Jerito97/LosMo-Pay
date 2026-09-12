// Réplica de balances()/ledgerFor()/myEffect() de LosMo Pay.dc.html,
// generalizada: en el prototipo "yo" era siempre u1; acá `meId` es
// cualquier usuario logueado. El reparto es siempre en partes iguales
// entre los participantes de cada gasto.

export interface ExpenseForBalance {
  id: string;
  amount: number;
  payerId: string;
  participantIds: string[];
}

export interface PaymentForBalance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export function shareOf(expense: ExpenseForBalance): number {
  return expense.amount / expense.participantIds.length;
}

export function myShareOf(expense: ExpenseForBalance, meId: string): number {
  return expense.participantIds.includes(meId) ? shareOf(expense) : 0;
}

/**
 * Cuánto cambia mi saldo por este gasto puntual:
 * positivo si lo pagué yo (me deben su parte los demás participantes),
 * negativo si participé pero lo pagó otra persona (le debo mi parte),
 * 0 si no participo.
 */
export function myEffect(expense: ExpenseForBalance, meId: string): number {
  const share = shareOf(expense);
  if (expense.payerId === meId) {
    const others = expense.participantIds.filter((id) => id !== meId).length;
    return others * share;
  }
  if (expense.participantIds.includes(meId)) {
    return -share;
  }
  return 0;
}

/**
 * Saldo neto de `meId` contra cada otra persona: positivo = te debe,
 * negativo = le debés. Gastos y pagos entre otras dos personas (sin `meId`)
 * no afectan este resultado.
 */
export function computeBalances(
  meId: string,
  expenses: ExpenseForBalance[],
  payments: PaymentForBalance[],
): Record<string, number> {
  const balance: Record<string, number> = {};

  for (const expense of expenses) {
    const share = shareOf(expense);
    if (expense.payerId === meId) {
      for (const participantId of expense.participantIds) {
        if (participantId === meId) continue;
        balance[participantId] = (balance[participantId] ?? 0) + share;
      }
    } else if (expense.participantIds.includes(meId)) {
      balance[expense.payerId] = (balance[expense.payerId] ?? 0) - share;
    }
  }

  for (const payment of payments) {
    if (payment.fromUserId === meId && payment.toUserId !== meId) {
      // Le pagué a alguien: mi deuda hacia esa persona baja (o mi crédito sube).
      balance[payment.toUserId] = (balance[payment.toUserId] ?? 0) + payment.amount;
    } else if (payment.toUserId === meId && payment.fromUserId !== meId) {
      // Me pagó alguien: lo que me debía baja.
      balance[payment.fromUserId] = (balance[payment.fromUserId] ?? 0) - payment.amount;
    }
  }

  return balance;
}

export function netTotal(balance: Record<string, number>): number {
  return Object.values(balance).reduce((sum, value) => sum + value, 0);
}

export interface LedgerRow {
  kind: "expense" | "payment";
  id: string;
  label: string;
  direction: string;
  amount: number; // firmado: positivo a mi favor
  date: string;
}

export interface ExpenseForLedger extends ExpenseForBalance {
  description: string;
  expenseDate: string;
}

export interface PaymentForLedger extends PaymentForBalance {
  id: string;
  createdAt: string;
}

/** Detalle del saldo entre `meId` y `otherId`: monto neto + movimientos que lo explican. */
export function ledgerBetween(
  meId: string,
  otherId: string,
  expenses: ExpenseForLedger[],
  payments: PaymentForLedger[],
): { amount: number; rows: LedgerRow[] } {
  if (meId === otherId) return { amount: 0, rows: [] };

  const rows: LedgerRow[] = [];

  for (const expense of expenses) {
    const share = shareOf(expense);
    if (expense.payerId === meId && expense.participantIds.includes(otherId)) {
      rows.push({
        kind: "expense",
        id: expense.id,
        label: expense.description,
        direction: "te debe su parte",
        amount: share,
        date: expense.expenseDate,
      });
    } else if (expense.payerId === otherId && expense.participantIds.includes(meId)) {
      rows.push({
        kind: "expense",
        id: expense.id,
        label: expense.description,
        direction: "le debés tu parte",
        amount: -share,
        date: expense.expenseDate,
      });
    }
  }

  for (const payment of payments) {
    if (payment.fromUserId === otherId && payment.toUserId === meId) {
      rows.push({
        kind: "payment",
        id: payment.id,
        label: "Pago",
        direction: "te pagó",
        amount: -payment.amount,
        date: payment.createdAt,
      });
    } else if (payment.fromUserId === meId && payment.toUserId === otherId) {
      rows.push({
        kind: "payment",
        id: payment.id,
        label: "Pago",
        direction: "le pagaste",
        amount: payment.amount,
        date: payment.createdAt,
      });
    }
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  const amount = rows.reduce((sum, row) => sum + row.amount, 0);
  return { amount, rows };
}
