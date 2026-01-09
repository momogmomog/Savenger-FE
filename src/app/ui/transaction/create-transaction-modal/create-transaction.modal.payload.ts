import { TransactionType } from '../../../api/transaction/transaction.type';
import { Category } from '../../../api/category/category';

export class CreateTransactionModalPayload {
  constructor(
    public readonly budgetId: number,
    public readonly categories: Category[],
    public readonly type: TransactionType = TransactionType.INCOME,
  ) {}
}
