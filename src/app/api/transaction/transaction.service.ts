import { Injectable } from '@angular/core';
import { TransactionRepository } from './transaction.repository';
import { TransactionQuery } from './transaction.query';
import { EmptyPage, Page } from '../../shared/util/page';
import { Transaction } from './transaction';
import { FieldErrorWrapper } from '../../shared/util/field-error-wrapper';

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
}
