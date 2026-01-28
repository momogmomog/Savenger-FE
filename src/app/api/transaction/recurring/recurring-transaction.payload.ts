import { TransactionType } from '../transaction.type';

export interface RecurringTransactionPayload {
  type: TransactionType;
  amount: number;
  recurringRule: string;
  autoExecute: boolean;
  categoryId: number;
  budgetId: number;
  tagIds: number[];
}
