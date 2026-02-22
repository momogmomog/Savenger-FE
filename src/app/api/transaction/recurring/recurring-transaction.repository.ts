import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../../shared/http/http-client-secured.service';
import { RecurringTransactionPayload } from './recurring-transaction.payload';
import { Observable } from 'rxjs';
import { RecurringTransaction } from './recurring-transaction';
import { Endpoints } from '../../../shared/http/endpoints';
import { RecurringTransactionQuery } from './recurring-transaction.query';
import { Page } from '../../../shared/util/page';
import { CreateTransactionPayload } from '../dto/create-transaction.payload';
import { RouteUtils } from '../../../shared/routing/route-utils';

@Injectable({ providedIn: 'root' })
export class RecurringTransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(
    payload: RecurringTransactionPayload,
  ): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransactionPayload, RecurringTransaction>(
      Endpoints.RECURRING_TRANSACTIONS,
      payload,
    );
  }

  public edit(
    id: number,
    payload: RecurringTransactionPayload,
  ): Observable<RecurringTransaction> {
    return this.http.put<RecurringTransactionPayload, RecurringTransaction>(
      RouteUtils.setPathParams(Endpoints.RECURRING_TRANSACTION, [id]),
      payload,
    );
  }

  public get(id: number): Observable<RecurringTransaction> {
    return this.http.get<RecurringTransaction>(
      RouteUtils.setPathParams(Endpoints.RECURRING_TRANSACTION, [id]),
    );
  }

  public search(
    query: RecurringTransactionQuery,
  ): Observable<Page<RecurringTransaction>> {
    return this.http.post<
      RecurringTransactionQuery,
      Page<RecurringTransaction>
    >(Endpoints.RECURRING_TRANSACTIONS_SEARCH, query);
  }

  public execute(
    rTransactionId: number,
    transactionOverride: CreateTransactionPayload,
  ): Observable<RecurringTransaction> {
    return this.http.post<CreateTransactionPayload, RecurringTransaction>(
      RouteUtils.setPathParams(Endpoints.RECURRING_TRANSACTIONS_EXECUTE, [
        rTransactionId,
      ]),
      transactionOverride,
    );
  }
}
