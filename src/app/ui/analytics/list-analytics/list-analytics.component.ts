import { Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';
import {
  ActionSheetController,
  AlertController,
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
  TransactionQuery,
  TransactionQueryImpl,
} from '../../../api/transaction/transactionSearchQuery';

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

  budget = this.budgetSliderService.currentBudget;
  categoryAnalytics = signal<CategoryAnalytic[]>([]);
  tagAnalytics = signal<TagAnalytic[]>([]);

  selectedSegment = signal<ChartSegment>(ChartSegment.CATEGORIES);
  chartMode = signal<ChartMode>(ChartMode.EXPENSE);
  isFiltering = signal<boolean>(false);

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
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
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
      !!this.query.amount || !!this.query.dateCreated || !!this.query.comment,
    );

    const [catResp, tagResp] = await Promise.all([
      this.analyticsService.getCategoryAnalytics(this.query),
      this.analyticsService.getTagAnalytics(this.query),
    ]);

    if (catResp.isSuccess) {
      this.categoryAnalytics.set(catResp.response);
      this.updateCategoryChart(catResp.response);
    }

    if (tagResp.isSuccess) {
      this.tagAnalytics.set(tagResp.response);
      this.updateTagChart(tagResp.response);
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
      ? [
          '#2dd36f',
          '#28ba62',
          '#22a053',
          '#1c8645',
          '#42d77d',
          '#59db8c',
          '#6fe09b',
          '#86e4a9',
        ]
      : [
          '#428cff',
          '#50c8ff',
          '#a58fff',
          '#ffc409',
          '#eb445a',
          '#2dd36f',
          '#e0e0e0',
          '#808080',
        ];

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
          backgroundColor: isIncome ? '#2dd36f' : '#428cff',
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
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter Analytics',
      buttons: [
        {
          text: 'Date Range',
          icon: 'calendar',
          handler: (): void => void this.presentDateFilterAlert(),
        },
        {
          text: 'Amount Range',
          icon: 'filter',
          handler: (): void => void this.presentAmountFilterAlert(),
        },
        {
          text: 'Clear Filters',
          role: 'destructive',
          handler: (): void => {
            this.query.amount = null;
            this.query.dateCreated = null;
            this.query.comment = null;
            void this.fetchAnalytics();
          },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  async presentDateFilterAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Date Range',
      inputs: [
        {
          name: 'min',
          type: 'date',
          placeholder: 'From',
          value: this.query.dateCreated?.min,
        },
        {
          name: 'max',
          type: 'date',
          placeholder: 'To',
          value: this.query.dateCreated?.max,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Apply',
          handler: (data): void => {
            if (data.min || data.max) {
              this.query.dateCreated = { min: data.min, max: data.max };
            } else {
              this.query.dateCreated = null;
            }
            void this.fetchAnalytics();
          },
        },
      ],
    });
    await alert.present();
  }

  async presentAmountFilterAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Filter by Amount',
      inputs: [
        {
          name: 'min',
          type: 'number',
          placeholder: 'Min',
          value: this.query.amount?.min,
        },
        {
          name: 'max',
          type: 'number',
          placeholder: 'Max',
          value: this.query.amount?.max,
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Apply',
          handler: (data): void => {
            const min = data.min ? parseFloat(data.min) : undefined;
            const max = data.max ? parseFloat(data.max) : undefined;
            if (min !== undefined || max !== undefined) {
              this.query.amount = { min, max };
            } else {
              this.query.amount = null;
            }
            void this.fetchAnalytics();
          },
        },
      ],
    });
    await alert.present();
  }

  getPercentage(current: number, max: number): number {
    if (!max || max === 0) return 0;
    return Math.min(current / max, 1);
  }
}
