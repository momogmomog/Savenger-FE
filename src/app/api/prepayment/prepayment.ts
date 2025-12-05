export interface Prepayment {
  id: number;
  amount: number;
  name: string;
  createDate: string;
  updateDate: string;
  paidUntil: string;
  completed: boolean;
  remainingAmount: number;
  budgetId: number;
}
