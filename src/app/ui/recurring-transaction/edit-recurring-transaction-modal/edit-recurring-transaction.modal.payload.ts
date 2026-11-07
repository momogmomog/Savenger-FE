import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';

export class EditRecurringTransactionModalPayload {
  constructor(public readonly transaction: RecurringTransaction) {}
}
