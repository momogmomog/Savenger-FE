import { TransactionType } from '../transaction.type';

export interface TransactionBasicDto {
  id: number;
  amount: number;
  type: TransactionType;
  dateCreated: string;
  revised: boolean;
}
