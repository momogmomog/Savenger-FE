import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../../shared/http/http-client-secured.service';
import { RecurringTransactionPayload } from './recurring-transaction.payload';
import { Observable } from 'rxjs';
import { RecurringTransaction } from './recurring-transaction';

@Injectable({ providedIn: 'root' })
export class RecurringTransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(
    payload: RecurringTransactionPayload,
  ): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransactionPayload, RecurringTransaction>(
      'TODO',
      payload,
    );
  }
}
