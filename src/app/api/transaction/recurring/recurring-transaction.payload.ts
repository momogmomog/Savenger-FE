import { TransactionType } from '../transaction.type';

export interface RecurringTransactionPayload {
  type: TransactionType;
  amount: number;
  recurringRule: string;
  autoExecute: boolean;
  categoryId: number;
  budgetId: number;
  includeInBalance: boolean;
  comment: string | null;
  startFrom: Date | null;
  tagIds: number[];
}
