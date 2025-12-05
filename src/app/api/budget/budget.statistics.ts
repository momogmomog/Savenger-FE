import { BudgetFull } from './budget';

export interface BudgetStatistics {
  budget: BudgetFull;
  balance: number;
  expensesAmount: number;
  earningsAmount: number;
  debtLendedAmount: number;
  debtReceivedAmount: number;
  realBalance: number;
}
