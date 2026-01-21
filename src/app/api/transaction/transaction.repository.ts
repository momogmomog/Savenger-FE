import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { TransactionSearchQuery } from './transactionSearchQuery';
import { Observable } from 'rxjs';
import { Page } from '../../shared/util/page';
import { Transaction, TransactionDetailed } from './transaction';
import { Endpoints } from '../../shared/http/endpoints';
import { CreateTransactionPayload } from './dto/create-transaction.payload';
import { RouteUtils } from '../../shared/routing/route-utils';

@Injectable({ providedIn: 'root' })
export class TransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public search(query: TransactionSearchQuery): Observable<Page<Transaction>> {
    return this.http.post<TransactionSearchQuery, Page<Transaction>>(
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

  public get(transactionId: number): Observable<TransactionDetailed> {
    return this.http.get<TransactionDetailed>(
      RouteUtils.setPathParams(Endpoints.TRANSACTION, [transactionId]),
    );
  }

  public delete(transactionId: number): Observable<void> {
    return this.http.delete<void>(
      RouteUtils.setPathParams(Endpoints.TRANSACTION, [transactionId]),
    );
  }
}
