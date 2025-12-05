import { TransactionType } from '../transaction.type';

export interface CreateTransactionPayload {
  type: TransactionType;
  amount: number;
  dateCreated: Date | null;
  comment: string | null;
  categoryId: number | null;
  budgetId: number;
  debtId: number | null;
  prepaymentId: number | null;
  tagIds: number[];
}
