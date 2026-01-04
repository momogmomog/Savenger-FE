import { Injectable, signal } from '@angular/core';
import { Budget, EmptyBudget } from '../../../api/budget/budget';

@Injectable({ providedIn: 'root' })
export class BudgetSliderService {
  private readonly _currentBudget = signal<Budget>(new EmptyBudget());

  public readonly currentBudget = this._currentBudget.asReadonly();

  public setBudget(budget: Budget): void {
    this._currentBudget.set(budget);
  }
}
