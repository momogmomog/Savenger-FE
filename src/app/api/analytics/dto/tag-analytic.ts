import { TransactionSumAndCount } from './transaction-sum-and-count';
import { Tag } from '../../tag/tag';

export interface TagAnalytic {
  tag: Tag;

  incomes: TransactionSumAndCount;
  expenses: TransactionSumAndCount;
}
