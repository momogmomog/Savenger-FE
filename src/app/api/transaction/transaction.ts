import { TransactionType } from './transaction.type';
import { Tag } from '../tag/tag';
import { Category } from '../category/category';
import { OtherUser } from '../user/user';
import { TransactionBasicDto } from './dto/transaction-basic.dto';

export interface Transaction extends TransactionBasicDto {
  id: number;
  type: TransactionType;
  amount: number;
  dateCreated: string;
  comment: string;
  revised: boolean;
  recurringTransactionId: number;
  prepaymentId: number;
  userId: number;
  debtId?: number;
  categoryId: number;
  budgetId: number;
  tags: Tag[];
}

export interface TransactionDetailed extends Transaction {
  category: Category;
  user: OtherUser;
}
