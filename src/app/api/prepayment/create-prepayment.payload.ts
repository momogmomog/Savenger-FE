import { RecurringTransactionPayload } from '../transaction/recurring/recurring-transaction.payload';

export interface CreatePrepaymentPayload {
  amount: number;
  name: string;
  paidUntil: Date;
  budgetId: number;
  recurringTransactionId: number | null;
  recurringTransaction: RecurringTransactionPayload | null;
}
