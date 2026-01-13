import { TransactionDetailed } from '../../../api/transaction/transaction';

export class EditTransactionModalPayload {
  constructor(public readonly transaction: TransactionDetailed) {}
}
