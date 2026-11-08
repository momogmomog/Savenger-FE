import { Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDown,
  arrowUp,
  calendar,
  filter,
  funnel,
  pricetag,
  wallet,
} from 'ionicons/icons';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { AnalyticsService } from '../../../api/analytics/analytics.service';
import { CategoryAnalytic } from '../../../api/analytics/dto/category-analytic';
import { TagAnalytic } from '../../../api/analytics/dto/tag-analytic';
import {
  AnalyticsSummaryDto,
  EmptyAnalyticsSummaryDto,
} from '../../../api/analytics/dto/analytics-summary.dto';
import {
  TransactionQuery,
  TransactionQueryImpl,
} from '../../../api/transaction/transactionSearchQuery';
import { ModalService } from '../../../shared/modal/modal.service';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { TransactionFilterModalComponent } from '../../transaction/transaction-filter-modal/transaction-filter-modal.component';
import {
  TransactionFilterModalPayload,
  TransactionFilterModalResult,
} from '../../transaction/transaction-filter-modal/transaction-filter-modal.payload';
import { Tag } from '../../../api/tag/tag';
import { Category } from '../../../api/category/category';
import { OtherUser } from '../../../api/user/user';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

enum ChartMode {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME',
}

enum ChartSegment {
  CATEGORIES = 'CATEGORIES',
  TAGS = 'TAGS',
}

@Component({
  selector: 'app-list-analytics',
  templateUrl: './list-analytics.component.html',
  styleUrls: ['./list-analytics.component.scss'],
  imports: [
    BudgetSliderComponent,
    IonContent,
    IonHeader,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonNote,
    IonProgressBar,
    IonIcon,
    IonButtons,
    IonButton,
    IonText,
    BaseChartDirective,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
  ],
})
export class ListAnalyticsComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  ChartSegment = ChartSegment;
  ChartMode = ChartMode;
  protected readonly TransactionType = TransactionType;
  protected readonly TransactionUtils = TransactionUtils;

  budget = this.budgetSliderService.currentBudget;
  categorySummary = signal<AnalyticsSummaryDto<CategoryAnalytic>>(
    new EmptyAnalyticsSummaryDto(),
  );
  tagSummary = signal<AnalyticsSummaryDto<TagAnalytic>>(
    new EmptyAnalyticsSummaryDto(),
  );
  categoryAnalytics = signal<CategoryAnalytic[]>([]);
  tagAnalytics = signal<TagAnalytic[]>([]);

  selectedSegment = signal<ChartSegment>(ChartSegment.CATEGORIES);
  chartMode = signal<ChartMode>(ChartMode.EXPENSE);
  isFiltering = signal<boolean>(false);

  activeFilterTags = signal<Tag[]>([]);
  activeFilterCategories = signal<Category[]>([]);
  activeFilterUsers = signal<OtherUser[]>([]);

  categoryChartData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });
  tagChartData = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  maxTagsToDisplay = signal<number>(10);

  query: TransactionQuery = new TransactionQueryImpl(null);

  categoryChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#9d9fa6', boxWidth: 12 } },
    },
    elements: { arc: { borderWidth: 0 } },
  };

  public tagChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#333' }, ticks: { color: '#9d9fa6' } },
      y: { grid: { display: false }, ticks: { color: '#fff' } },
    },
  };

  constructor(
    private budgetSliderService: BudgetSliderService,
    private analyticsService: AnalyticsService,
    private modalService: ModalService,
  ) {
    addIcons({
      filter,
      funnel,
      wallet,
      pricetag,
      calendar,
      arrowDown,
      arrowUp,
    });

    effect(async () => {
      const budgetId = this.budget().id;
      if (budgetId !== BudgetSliderService.INITIAL_BUDGET.id) {
        this.clearFilterObjects();
        await this.updateQuery(budgetId);
      }
    });
  }

  ngOnInit(): void {}

  private async updateQuery(budgetId: number): Promise<void> {
    this.query = new TransactionQueryImpl(budgetId);
    this.query.revised = false;
    await this.fetchAnalytics();
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.budgetSliderService.refreshStatistic(this.budget().id);
    await this.fetchAnalytics();
    void event.target.complete();
  }

  segmentChanged(ev: any): void {
    this.selectedSegment.set(ev.detail.value);
    this.refreshCharts();
  }

  setChartMode(mode: ChartMode): void {
    this.chartMode.set(mode);
    this.refreshCharts();
  }

  private refreshCharts(): void {
    if (this.selectedSegment() === ChartSegment.CATEGORIES) {
      this.updateCategoryChart(this.categoryAnalytics());
    } else {
      this.updateTagChart(this.tagAnalytics());
    }
  }

  private async fetchAnalytics(): Promise<void> {
    this.isFiltering.set(
      !!this.query.type ||
        !!this.query.amount ||
        !!this.query.dateCreated ||
        !!this.query.comment ||
        this.query.categoryIds.length > 0 ||
        this.query.tagIds.length > 0 ||
        this.query.userIds.length > 0,
    );

    const [catResp, tagResp] = await Promise.all([
      this.analyticsService.getCategoryAnalytics(this.query),
      this.analyticsService.getTagAnalytics(this.query),
    ]);

    if (catResp.isSuccess) {
      this.categorySummary.set(catResp.response);
      this.categoryAnalytics.set(catResp.response.items);
      this.updateCategoryChart(catResp.response.items);
    }

    if (tagResp.isSuccess) {
      this.tagSummary.set(tagResp.response);
      this.tagAnalytics.set(tagResp.response.items);
      this.updateTagChart(tagResp.response.items);
    }
  }

  private updateCategoryChart(data: CategoryAnalytic[]): void {
    const isIncome = this.chartMode() === ChartMode.INCOME;

    // Filter based on the selected mode
    const activeData = data
      .filter((d) => (isIncome ? d.incomes.sum > 0 : d.expenses.sum > 0))
      .sort((a, b) =>
        isIncome
          ? b.incomes.sum - a.incomes.sum
          : b.expenses.sum - a.expenses.sum,
      );

    const labels = activeData.map((d) => d.category.categoryName);
    const values = activeData.map((d) =>
      isIncome ? d.incomes.sum : d.expenses.sum,
    );

    const colors = isIncome
      ? TransactionUtils.CHART_INCOME_PALETTE
      : TransactionUtils.CHART_EXPENSE_PALETTE;

    this.categoryChartData.set({
      labels: labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          hoverOffset: 4,
        },
      ],
    });

    this.categoryAnalytics.set(
      this.categoryAnalytics().sort((a, b) => {
        if (isIncome) {
          return b.incomes.sum - a.incomes.sum;
        }

        return b.expenses.sum - a.expenses.sum;
      }),
    );
  }

  private updateTagChart(data: TagAnalytic[]): void {
    const isIncome = this.chartMode() === ChartMode.INCOME;

    const activeData = data
      .filter((d) => (isIncome ? d.incomes.sum > 0 : d.expenses.sum > 0))
      .sort((a, b) =>
        isIncome
          ? b.incomes.sum - a.incomes.sum
          : b.expenses.sum - a.expenses.sum,
      )
      .slice(0, this.maxTagsToDisplay());

    this.tagChartData.set({
      labels: activeData.map((d) => '#' + d.tag.tagName),
      datasets: [
        {
          data: activeData.map((d) =>
            isIncome ? d.incomes.sum : d.expenses.sum,
          ),
          backgroundColor: isIncome
            ? TransactionUtils.CHART_INCOME_COLOR
            : TransactionUtils.CHART_EXPENSE_COLOR,
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    });

    this.tagAnalytics.set(
      this.tagAnalytics().sort((a, b) => {
        if (isIncome) {
          return b.incomes.sum - a.incomes.sum;
        }

        return b.expenses.sum - a.expenses.sum;
      }),
    );
  }

  async presentFilterOptions(): Promise<void> {
    const payload = new TransactionFilterModalPayload(
      this.budget().id,
      this.query,
      this.activeFilterTags(),
      this.activeFilterCategories(),
      this.activeFilterUsers(),
    );

    const resp = await this.modalService.openAndWait(
      TransactionFilterModalComponent,
      payload,
      {
        shellType: ShellType.HEADER,
        title: 'Filter Analytics',
      },
    );

    resp.ifConfirmed((result: TransactionFilterModalResult) => {
      this.setFilterObjects(result);
    });
  }

  private setFilterObjects(result: TransactionFilterModalResult): void {
    this.activeFilterTags.set(result.selectedTags);
    this.activeFilterCategories.set(result.selectedCategories);
    this.activeFilterUsers.set(result.selectedUsers);

    Object.assign(this.query, result.query);
    void this.fetchAnalytics();
  }

  private clearFilterObjects(): void {
    this.activeFilterUsers.set([]);
    this.activeFilterCategories.set([]);
    this.activeFilterTags.set([]);
  }

  getPercentage(current: number, max: number): number {
    return TransactionUtils.getUtilizationPercentage(current, max);
  }
}
