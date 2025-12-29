import { Injectable } from '@angular/core';
import { CreateBudgetPayload } from './dto/create-budget.payload';
import { Observable } from 'rxjs';
import { Budget, BudgetFull } from './budget';
import { Endpoints } from '../../shared/http/endpoints';
import { RouteUtils } from '../../shared/routing/route-utils';
import { BudgetQuery } from './budget.query';
import { Page } from '../../shared/util/page';
import { AssignUnassignParticipantPayload } from './dto/assign-unassign-participant.payload';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { BudgetStatistics } from './budget.statistics';

@Injectable({ providedIn: 'root' })
export class BudgetRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(payload: CreateBudgetPayload): Observable<Budget> {
    return this.http.post<CreateBudgetPayload, Budget>(
      Endpoints.BUDGETS,
      payload,
    );
  }

  public edit(
    budgetId: number,
    payload: CreateBudgetPayload,
  ): Observable<Budget> {
    return this.http.put<CreateBudgetPayload, Budget>(
      RouteUtils.setPathParams(Endpoints.BUDGET, [budgetId]),
      payload,
    );
  }

  public get(budgetId: number): Observable<Budget> {
    return this.http.get<Budget>(
      RouteUtils.setPathParams(Endpoints.BUDGET, [budgetId]),
    );
  }

  public delete(budgetId: number): Observable<Budget> {
    return this.http.delete<Budget>(
      RouteUtils.setPathParams(Endpoints.BUDGET, [budgetId]),
    );
  }

  public getStatistics(budgetId: number): Observable<BudgetStatistics> {
    return this.http.get<BudgetStatistics>(
      RouteUtils.setPathParams(Endpoints.BUDGET_STATISTICS, [budgetId]),
    );
  }

  public search(query: BudgetQuery): Observable<Page<Budget>> {
    return this.http.post<BudgetQuery, Page<Budget>>(
      Endpoints.BUDGET_SEARCH,
      query,
    );
  }

  public assignParticipant(
    budgetId: number,
    payload: AssignUnassignParticipantPayload,
  ): Observable<BudgetFull> {
    return this.http.post<AssignUnassignParticipantPayload, BudgetFull>(
      RouteUtils.setPathParams(Endpoints.PARTICIPANTS, [budgetId]),
      payload,
    );
  }

  public unassignParticipant(
    budgetId: number,
    payload: AssignUnassignParticipantPayload,
  ): Observable<BudgetFull> {
    return this.http.deleteBody<AssignUnassignParticipantPayload, BudgetFull>(
      RouteUtils.setPathParams(Endpoints.PARTICIPANTS, [budgetId]),
      payload,
    );
  }
}
