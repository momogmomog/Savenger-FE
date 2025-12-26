export enum BudgetRecurrenceType {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export const BUDGET_RECURRENCES: Record<BudgetRecurrenceType, string> = {
  [BudgetRecurrenceType.WEEKLY]: 'FREQ=WEEKLY;INTERVAL=1',
  [BudgetRecurrenceType.MONTHLY]: 'FREQ=MONTHLY;INTERVAL=1',
  [BudgetRecurrenceType.YEARLY]: 'FREQ=YEARLY;INTERVAL=1',
};
