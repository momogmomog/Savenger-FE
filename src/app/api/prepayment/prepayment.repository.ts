import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { CreatePrepaymentPayload } from './create-prepayment.payload';
import { Prepayment } from './prepayment';
import { Endpoints } from '../../shared/http/endpoints';
import { RouteUtils } from '../../shared/routing/route-utils';
import { PrepaymentQuery } from './prepayment.query';
import { Page } from '../../shared/util/page';
import { RecurringTransaction } from '../transaction/recurring/recurring-transaction';

@Injectable({ providedIn: 'root' })
export class PrepaymentRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(payload: CreatePrepaymentPayload): Observable<Prepayment> {
    return this.http.post<CreatePrepaymentPayload, Prepayment>(
      Endpoints.PREPAYMENTS,
      payload,
    );
  }

  public get(id: number): Observable<Prepayment> {
    return this.http.get<Prepayment>(
      RouteUtils.setPathParams(Endpoints.PREPAYMENT, [id]),
    );
  }

  public edit(
    id: number,
    payload: CreatePrepaymentPayload,
  ): Observable<Prepayment> {
    return this.http.put<CreatePrepaymentPayload, Prepayment>(
      RouteUtils.setPathParams(Endpoints.PREPAYMENT, [id]),
      payload,
    );
  }

  public search(query: PrepaymentQuery): Observable<Page<Prepayment>> {
    return this.http.post<PrepaymentQuery, Page<Prepayment>>(
      Endpoints.PREPAYMENTS_SEARCH,
      query,
    );
  }

  public pay(rTransactionId: number): Observable<RecurringTransaction> {
    return this.http.post<null, RecurringTransaction>(
      RouteUtils.setPathParams(Endpoints.PREPAYMENT_PAY, [rTransactionId]),
      null,
    );
  }
}
