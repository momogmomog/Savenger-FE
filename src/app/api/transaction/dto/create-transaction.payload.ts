import { TransactionType } from '../transaction.type';

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  dateCreated: Date | null;
  comment: string | null;
  categoryId: number;
  budgetId: number;
  tagIds: number[];
}
