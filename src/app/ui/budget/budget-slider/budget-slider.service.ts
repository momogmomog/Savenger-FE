import { Injectable, signal } from '@angular/core';
import { Budget, EmptyBudget } from '../../../api/budget/budget';
import { Tag } from '../../../api/tag/tag';
import { Category } from '../../../api/category/category';
import { TagService } from '../../../api/tag/tag.service';
import { TagQueryImpl } from '../../../api/tag/tag.query';
import { CategoryService } from '../../../api/category/category.service';
import { STORAGE_CURRENT_BUDGET_ID } from '../../../shared/general.constants';
import { Page } from '../../../shared/util/page';
import {
  BudgetStatistics,
  EmptyBudgetStatistics,
} from '../../../api/budget/budget.statistics';
import { BudgetService } from '../../../api/budget/budget.service';

@Injectable({ providedIn: 'root' })
export class BudgetSliderService {
  public static readonly INITIAL_BUDGET: Budget = JSON.parse(
    JSON.stringify(new EmptyBudget()),
  );

  private readonly _currentBudget = signal<Budget>(
    BudgetSliderService.INITIAL_BUDGET,
  );

  private storageInitialized = false;

  private readonly _currentCategories = signal<Category[]>([]);
  private readonly _currentTags = signal<Tag[]>([]);
  private readonly _currentStatistic = signal<BudgetStatistics>(
    new EmptyBudgetStatistics(),
  );

  public readonly currentBudget = this._currentBudget.asReadonly();
  public readonly currentCategories = this._currentCategories.asReadonly();
  public readonly currentTags = this._currentTags.asReadonly();
  public readonly currentStatistic = this._currentStatistic.asReadonly();

  constructor(
    private categoryService: CategoryService,
    private budgetService: BudgetService,
    private tagService: TagService,
  ) {}

  public async setBudget(budget: Budget): Promise<void> {
    console.log(`Switching to budget ${budget.budgetName}; ID: ${budget.id}`);
    if (budget.id === this.currentBudget().id) {
      console.log('Same as current budget!');
      return;
    }

    const promises: Promise<any>[] = [];
    let tags: Page<Tag>;
    let categories: Category[];
    let statistic: BudgetStatistics;

    promises.push(
      this.tagService
        .search(new TagQueryImpl(budget.id))
        .then((res) => (tags = res)),
    );
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

    this._currentTags.set(tags!.content);
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

  public async initializeFromStorage(budgets: Budget[]): Promise<void> {
    if (budgets.length === 0 || this.storageInitialized) return;
    console.log('Initializing budget from storage');

    const storedId = Number(localStorage.getItem(STORAGE_CURRENT_BUDGET_ID));
    const found = budgets.find((b) => b.id === storedId);

    if (found) {
      await this.setBudget(found);
    } else {
      // Default to first if storage is invalid/empty
      await this.setBudget(budgets[0]);
      this.storageInitialized = true;
    }
  }

  public isStorageInitialized(): boolean {
    return this.storageInitialized;
  }
}
