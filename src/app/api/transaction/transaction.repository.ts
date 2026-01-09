import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { TransactionQuery } from './transaction.query';
import { Observable } from 'rxjs';
import { Page } from '../../shared/util/page';
import { Transaction } from './transaction';
import { Endpoints } from '../../shared/http/endpoints';
import { CreateTransactionPayload } from './dto/create-transaction.payload';
import { RouteUtils } from '../../shared/routing/route-utils';

@Injectable({ providedIn: 'root' })
export class TransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public search(query: TransactionQuery): Observable<Page<Transaction>> {
    return this.http.post<TransactionQuery, Page<Transaction>>(
      Endpoints.TRANSACTIONS_SEARCH,
      query,
    );
  }

  public create(payload: CreateTransactionPayload): Observable<Transaction> {
    return this.http.post<CreateTransactionPayload, Transaction>(
      Endpoints.TRANSACTIONS,
      payload,
    );
  }

  public edit(
    payload: CreateTransactionPayload,
    transactionId: number,
  ): Observable<Transaction> {
    return this.http.put<CreateTransactionPayload, Transaction>(
      RouteUtils.setPathParams(Endpoints.TRANSACTION, [transactionId]),
      payload,
    );
  }
}
