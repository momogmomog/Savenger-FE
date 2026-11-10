import { Injectable } from '@angular/core';
import { PrepaymentRepository } from './prepayment.repository';
import { CreatePrepaymentPayload } from './create-prepayment.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { Prepayment } from './prepayment';
import { PrepaymentQuery } from './prepayment.query';
import { Page } from '../../shared/util/page';
import { RecurringTransaction } from '../transaction/recurring/recurring-transaction';

@Injectable({ providedIn: 'root' })
export class PrepaymentService {
  constructor(private repository: PrepaymentRepository) {}

  public async create(
    payload: CreatePrepaymentPayload,
  ): Promise<WrappedResponse<Prepayment>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async get(id: number): Promise<WrappedResponse<Prepayment>> {
    return await new FieldErrorWrapper(() => this.repository.get(id)).execute();
  }

  public async edit(
    id: number,
    payload: CreatePrepaymentPayload,
  ): Promise<WrappedResponse<Prepayment>> {
    return await new FieldErrorWrapper(() =>
      this.repository.edit(id, payload),
    ).execute();
  }

  public async search(
    query: PrepaymentQuery,
  ): Promise<WrappedResponse<Page<Prepayment>>> {
    return await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();
  }

  public async pay(
    rTransactionId: number,
  ): Promise<WrappedResponse<RecurringTransaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.pay(rTransactionId),
    ).execute();
  }
}
