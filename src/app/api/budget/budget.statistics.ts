import { BudgetFull, EmptyBudget } from './budget';

export interface BudgetStatistics {
  budget: BudgetFull;
  balance: number;
  expensesAmount: number;
  earningsAmount: number;
  debtLendedAmount: number;
  debtReceivedAmount: number;
  realBalance: number;
}

export class EmptyBudgetStatistics implements BudgetStatistics {
  budget = new EmptyBudget();
  balance = 0;
  expensesAmount = 0;
  earningsAmount = 0;
  debtLendedAmount = 0;
  debtReceivedAmount = 0;
  realBalance = 0;
}
