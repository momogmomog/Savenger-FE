import { Prepayment } from '../../../api/prepayment/prepayment';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';

export class EditPrepaymentModalPayload {
  constructor(
    public readonly prepayment: Prepayment,
    public readonly recurringTransaction: RecurringTransaction | null = null,
  ) {}
}
