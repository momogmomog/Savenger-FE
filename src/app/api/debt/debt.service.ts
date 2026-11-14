import { Injectable } from '@angular/core';
import { DebtRepository } from './debt.repository';
import { CreateDebtPayload } from './create-debt.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { Debt } from './debt';
import { DebtQuery } from './debt.query';
import { Page } from '../../shared/util/page';
import { PayDebtPayload } from './pay-debt.payload';

@Injectable({ providedIn: 'root' })
export class DebtService {
  constructor(private repository: DebtRepository) {}

  public async create(
    payload: CreateDebtPayload,
  ): Promise<WrappedResponse<Debt>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async get(id: number): Promise<WrappedResponse<Debt>> {
    return await new FieldErrorWrapper(() => this.repository.get(id)).execute();
  }

  public async search(query: DebtQuery): Promise<WrappedResponse<Page<Debt>>> {
    return await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();
  }

  public async pay(
    id: number,
    payload: PayDebtPayload,
  ): Promise<WrappedResponse<Debt>> {
    return await new FieldErrorWrapper(() =>
      this.repository.pay(id, payload),
    ).execute();
  }
}
