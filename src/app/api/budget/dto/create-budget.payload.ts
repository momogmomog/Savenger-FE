export interface CreateBudgetPayload {
  budgetName: string;
  recurringRule: string;
  dateStarted: Date;
  dueDate: Date;
  active: boolean;
  balance: number | null;
  budgetCap: number | null;
  autoRevise: boolean;
}
