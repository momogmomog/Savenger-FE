import { TransactionType } from '../transaction.type';
import { Tag } from '../../tag/tag';

export interface RecurringTransaction {
  id: number;
  type: TransactionType;
  recurringRule: string;
  nextDate: string;
  autoExecute: boolean;
  amount: number;
  prepaymentId: number;
  completed: boolean;
  categoryId: number;
  budgetId: number;
  tags: Tag[];
}
