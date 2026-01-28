import { Injectable } from '@angular/core';
import { RecurringTransactionRepository } from './recurring-transaction.repository';
import { RecurringTransactionPayload } from './recurring-transaction.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../../shared/util/field-error-wrapper';
import { RecurringTransaction } from './recurring-transaction';

@Injectable({ providedIn: 'root' })
export class RecurringTransactionService {
  constructor(private repository: RecurringTransactionRepository) {}

  public async create(
    payload: RecurringTransactionPayload,
  ): Promise<WrappedResponse<RecurringTransaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }
}
