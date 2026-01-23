import { Budget } from '../budget/budget';

export interface Transfer {
  id: number;
  sourceBudgetId: number;
  receiverBudgetId: number;
  active: boolean;
  receiverBudget: Budget;
}

export interface TransferFull extends Transfer {
  sourceBudget: Budget;
}
