export interface Revision {
  id: number;
  revisionDate: string;
  budgetStartDate: string;
  balance: number;
  budgetCap: number;
  expensesAmount: number;
  earningsAmount: number;
  debtLendedAmount: number;
  debtReceivedAmount: number;
  compensationAmount: number;
  autoRevise: boolean;
  comment: string;
  budgetId: number;
}
