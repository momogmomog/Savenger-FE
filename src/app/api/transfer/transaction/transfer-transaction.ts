import { TransferFull } from '../transfer';
import { Transaction } from '../../transaction/transaction';

export interface TransferTransaction {
  transfer: TransferFull;
  transferTransactionId: number;
  sourceTransaction: Transaction;
  receiverTransaction: Transaction;
}
