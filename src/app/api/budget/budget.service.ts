import { Injectable } from '@angular/core';
import { BudgetRepository } from './budget.repository';
import { CreateBudgetPayload } from './dto/create-budget.payload';
import { Budget } from './budget';
import { BudgetQuery } from './budget.query';
import { Page } from '../../shared/util/page';
import { AssignUnassignParticipantPayload } from './dto/assign-unassign-participant.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { BudgetStatistics } from './budget.statistics';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  constructor(private repository: BudgetRepository) {}

  public async create(
    payload: CreateBudgetPayload,
  ): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async edit(
    budgetId: number,
    payload: CreateBudgetPayload,
  ): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.edit(budgetId, payload),
    ).execute();
  }

  public async get(budgetId: number): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.get(budgetId),
    ).execute();
  }

  public async archive(budgetId: number): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.delete(budgetId),
    ).execute();
  }

  public async getStatistics(
    budgetId: number,
  ): Promise<WrappedResponse<BudgetStatistics>> {
    return await new FieldErrorWrapper(() =>
      this.repository.getStatistics(budgetId),
    ).execute();
  }

  public async search(
    query: BudgetQuery,
  ): Promise<WrappedResponse<Page<Budget>>> {
    return await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();
  }

  public async assignParticipant(
    budgetId: number,
    payload: AssignUnassignParticipantPayload,
  ): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.assignParticipant(budgetId, payload),
    ).execute();
  }

  public async unassignParticipant(
    budgetId: number,
    payload: AssignUnassignParticipantPayload,
  ): Promise<WrappedResponse<Budget>> {
    return await new FieldErrorWrapper(() =>
      this.repository.unassignParticipant(budgetId, payload),
    ).execute();
  }
}
