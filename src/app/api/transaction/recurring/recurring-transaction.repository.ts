import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../../shared/http/http-client-secured.service';
import { RecurringTransactionPayload } from './recurring-transaction.payload';
import { Observable } from 'rxjs';
import { RecurringTransaction } from './recurring-transaction';
import { Endpoints } from '../../../shared/http/endpoints';
import { RecurringTransactionQuery } from './recurring-transaction.query';
import { Page } from '../../../shared/util/page';

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

  public search(
    query: RecurringTransactionQuery,
  ): Observable<Page<RecurringTransaction>> {
    return this.http.post<
      RecurringTransactionQuery,
      Page<RecurringTransaction>
    >(Endpoints.RECURRING_TRANSACTIONS_SEARCH, query);
  }
}
