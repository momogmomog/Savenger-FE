import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { TransactionQuery } from './transaction.query';
import { Observable } from 'rxjs';
import { Page } from '../../shared/util/page';
import { Transaction } from './transaction';
import { Endpoints } from '../../shared/http/endpoints';

@Injectable({ providedIn: 'root' })
export class TransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public search(query: TransactionQuery): Observable<Page<Transaction>> {
    return this.http.post<TransactionQuery, Page<Transaction>>(
      Endpoints.TRANSACTIONS_SEARCH,
      query,
    );
  }
}
