import { TransactionType } from './transaction.type';
import { Tag } from '../tag/tag';

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

export interface TransactionDetailed extends Transaction {
  tags: Tag[];
}
