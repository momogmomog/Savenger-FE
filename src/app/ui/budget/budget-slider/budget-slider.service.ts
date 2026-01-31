import { Injectable, signal } from '@angular/core';
import { Budget, EmptyBudget } from '../../../api/budget/budget';
import { Category } from '../../../api/category/category';
import { CategoryService } from '../../../api/category/category.service';
import { STORAGE_CURRENT_BUDGET_ID } from '../../../shared/general.constants';
import {
  BudgetStatistics,
  EmptyBudgetStatistics,
} from '../../../api/budget/budget.statistics';
import { BudgetService } from '../../../api/budget/budget.service';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';

@Injectable({ providedIn: 'root' })
export class BudgetSliderService {
  public static readonly INITIAL_BUDGET: Budget = JSON.parse(
    JSON.stringify(new EmptyBudget()),
  );

  private readonly _currentBudget = signal<Budget>(
    BudgetSliderService.INITIAL_BUDGET,
  );

  private storageInitialized = false;
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();

  private readonly _currentCategories = signal<Category[]>([]);
  private readonly _currentStatistic = signal<BudgetStatistics>(
    new EmptyBudgetStatistics(),
  );
  private readonly _fetchedBudgets = signal<Budget[]>([]);

  public readonly currentBudget = this._currentBudget.asReadonly();
  public readonly currentCategories = this._currentCategories.asReadonly();
  public readonly currentStatistic = this._currentStatistic.asReadonly();
  public readonly fetchedBudgets = this._fetchedBudgets.asReadonly();

  constructor(
    private categoryService: CategoryService,
    private budgetService: BudgetService,
  ) {}

  public async setBudget(budget: Budget): Promise<void> {
    console.log(`Switching to budget ${budget.budgetName}; ID: ${budget.id}`);
    if (budget.id === this.currentBudget().id) {
      console.log('Same as current budget!');
      return;
    }

    const promises: Promise<any>[] = [];
    let categories: Category[];
    let statistic: BudgetStatistics;

    promises.push(
      this.categoryService
        .fetchAllCategories(budget.id)
        .then((res) => (categories = res)),
    );

    promises.push(
      this.budgetService.getStatistics(budget.id).then((value) => {
        statistic = value.response;
      }),
    );

    await Promise.all(promises);

    this._currentCategories.set(categories!);
    this._currentStatistic.set(statistic!);
    this._currentBudget.set(budget);
  }

  public async refreshStatistic(budgetId: number): Promise<void> {
    const statisticResp = await this.budgetService.getStatistics(budgetId);
    if (statisticResp.isSuccess) {
      this._currentStatistic.set(statisticResp.response);
    } else {
      console.error(statisticResp);
    }
  }

  public async initializeFromStorage(): Promise<void> {
    if (this.storageInitialized) {
      return;
    }

    const resp = await this.budgetService.search(this.budgetQuery);
    const budgets = resp.response.content;

    if (budgets.length === 0) return;

    console.log('Initializing budget from storage');

    const storedId = Number(localStorage.getItem(STORAGE_CURRENT_BUDGET_ID));
    const found = budgets.find((b) => b.id === storedId);

    this._fetchedBudgets.set(budgets);
    if (found) {
      await this.setBudget(found);
    } else {
      // Default to first if storage is invalid/empty
      await this.setBudget(budgets[0]);
    }
    this.storageInitialized = true;
  }

  public isStorageInitialized(): boolean {
    return this.storageInitialized;
  }

  public addToBudgetList(budget: Budget): Budget[] {
    const newList = [...this._fetchedBudgets(), budget];
    this._fetchedBudgets.set(newList);

    return newList;
  }
}
