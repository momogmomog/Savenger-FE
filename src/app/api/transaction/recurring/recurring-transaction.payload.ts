import { TransactionType } from '../transaction.type';

export interface RecurringTransactionPayload {
  type: TransactionType;
  amount: number;
  recurringRule: string;
  autoExecute: boolean;
  categoryId: number | null;
  budgetId: number;
  debtId: number | null;
  tagIds: number[];
}
