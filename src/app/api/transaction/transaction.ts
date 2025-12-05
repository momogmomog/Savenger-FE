import { TransactionType } from './transaction.type';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  dateCreated: string;
  comment: string;
  revised: boolean;
  userId: number;
  categoryId: number;
  budgetId: number;
}
