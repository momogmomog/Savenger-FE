import { TransactionSumAndCount } from '../../transaction/dto/transaction-sum-and-count';

export interface AnalyticDto {
  incomes: TransactionSumAndCount;
  expenses: TransactionSumAndCount;
}
