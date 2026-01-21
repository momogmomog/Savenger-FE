import { Category } from '../../category/category';
import { TransactionSumAndCount } from './transaction-sum-and-count';

export interface CategoryAnalytic {
  category: Category;

  incomes: TransactionSumAndCount;
  expenses: TransactionSumAndCount;
}
