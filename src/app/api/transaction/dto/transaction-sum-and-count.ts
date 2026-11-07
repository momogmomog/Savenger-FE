import { TransactionBasicDto } from './transaction-basic.dto';

export interface TransactionSumAndCount {
  sum: number;
  count: number;
  transactions: TransactionBasicDto[];
}
