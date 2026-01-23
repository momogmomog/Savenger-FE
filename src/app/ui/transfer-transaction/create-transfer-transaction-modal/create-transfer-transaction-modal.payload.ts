import { Transfer } from '../../../api/transfer/transfer';

export class CreateTransferTransactionModalPayload {
  constructor(public readonly transfer: Transfer) {}
}
