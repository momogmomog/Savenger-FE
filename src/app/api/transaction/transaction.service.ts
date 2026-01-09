import { Injectable } from '@angular/core';
import { TransactionRepository } from './transaction.repository';
import { TransactionQuery } from './transaction.query';
import { EmptyPage, Page } from '../../shared/util/page';
import { Transaction } from './transaction';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { CreateTransactionPayload } from './dto/create-transaction.payload';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  constructor(private repository: TransactionRepository) {}

  public async search(query: TransactionQuery): Promise<Page<Transaction>> {
    const resp = await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();

    if (!resp.isSuccess) {
      console.error(resp);
      return new EmptyPage();
    }

    return resp.response;
  }

  public async create(
    payload: CreateTransactionPayload,
  ): Promise<WrappedResponse<Transaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async edit(
    payload: CreateTransactionPayload,
    transactionId: number,
  ): Promise<WrappedResponse<Transaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.edit(payload, transactionId),
    ).execute();
  }
}
