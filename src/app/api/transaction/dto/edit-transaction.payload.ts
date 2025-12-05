import { TransactionType } from '../transaction.type';

export interface EditTransactionPayload {
  type: TransactionType;
  amount: number;
  dateCreated: Date;
  comment: string | null;
  categoryId: number | null;
  budgetId: number;
  tagIds: number[];
}
