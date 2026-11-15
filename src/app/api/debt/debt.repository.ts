import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { CreateDebtPayload } from './create-debt.payload';
import { Debt } from './debt';
import { Endpoints } from '../../shared/http/endpoints';
import { RouteUtils } from '../../shared/routing/route-utils';
import { DebtQuery } from './debt.query';
import { Page } from '../../shared/util/page';
import { PayDebtPayload } from './pay-debt.payload';

@Injectable({ providedIn: 'root' })
export class DebtRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(payload: CreateDebtPayload): Observable<Debt> {
    return this.http.post<CreateDebtPayload, Debt>(Endpoints.DEBTS, payload);
  }

  public get(id: number): Observable<Debt> {
    return this.http.get<Debt>(RouteUtils.setPathParams(Endpoints.DEBT, [id]));
  }

  public search(query: DebtQuery): Observable<Page<Debt>> {
    return this.http.post<DebtQuery, Page<Debt>>(Endpoints.DEBTS_SEARCH, query);
  }

  public pay(id: number, payload: PayDebtPayload): Observable<Debt> {
    return this.http.post<PayDebtPayload, Debt>(
      RouteUtils.setPathParams(Endpoints.PAY_DEBT, [id]),
      payload,
    );
  }
}
