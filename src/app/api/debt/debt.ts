export interface Debt {
  id: number;
  receiverBudgetId: number;
  lenderBudgetId: number;
  amount: number;
  createDate: string;
  updateDate: string;
}
