import { Injectable } from '@angular/core';
import { RecurringTransactionRepository } from './recurring-transaction.repository';
import { RecurringTransactionPayload } from './recurring-transaction.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../../shared/util/field-error-wrapper';
import { RecurringTransaction } from './recurring-transaction';
import { RecurringTransactionQuery } from './recurring-transaction.query';
import { Page } from '../../../shared/util/page';
import { CreateTransactionPayload } from '../dto/create-transaction.payload';

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

  public async search(
    query: RecurringTransactionQuery,
  ): Promise<WrappedResponse<Page<RecurringTransaction>>> {
    return await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();
  }

  public async execute(
    rTransactionId: number,
    override: CreateTransactionPayload,
  ): Promise<WrappedResponse<RecurringTransaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.execute(rTransactionId, override),
    ).execute();
  }
}
