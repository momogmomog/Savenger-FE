import { TransactionType } from './transaction.type';
import { Tag } from '../tag/tag';
import { Category } from '../category/category';
import { OtherUser } from '../user/user';

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
  tags: Tag[];
}

export interface TransactionDetailed extends Transaction {
  category: Category;
  user: OtherUser;
}
