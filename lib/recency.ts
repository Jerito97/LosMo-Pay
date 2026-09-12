export interface ExpenseForRecency {
  participantIds: string[];
  expenseDate: string;
}

/**
 * Reordena `users` poniendo primero a quienes participaron en los gastos
 * más recientes (probablemente los próximos en sumarse a un gasto nuevo).
 * Quienes nunca participaron quedan al final, en su orden original.
 */
export function sortByRecentExpenseActivity<U extends { id: string }>(
  users: U[],
  expenses: ExpenseForRecency[],
): U[] {
  const lastSeen = new Map<string, string>();
  for (const expense of expenses) {
    for (const userId of expense.participantIds) {
      const prev = lastSeen.get(userId);
      if (!prev || expense.expenseDate > prev) {
        lastSeen.set(userId, expense.expenseDate);
      }
    }
  }

  return [...users].sort((a, b) => {
    const dateA = lastSeen.get(a.id);
    const dateB = lastSeen.get(b.id);
    if (dateA && dateB) return dateA < dateB ? 1 : dateA > dateB ? -1 : 0;
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;
    return 0; // sin historial ninguno de los dos: mantiene el orden original
  });
}
