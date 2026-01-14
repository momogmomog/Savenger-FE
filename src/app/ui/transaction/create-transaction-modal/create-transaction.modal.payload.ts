import { TransactionType } from '../../../api/transaction/transaction.type';

export class CreateTransactionModalPayload {
  constructor(
    public readonly budgetId: number,
    public readonly type: TransactionType = TransactionType.INCOME,
  ) {}
}
