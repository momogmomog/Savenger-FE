import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ActionSheetController,
  AlertController,
  InfiniteScrollCustomEvent,
  IonButton,
  IonCard,
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonText,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, filter, funnel } from 'ionicons/icons';

import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { RecurringTransactionQueryImpl } from '../../../api/transaction/recurring/recurring-transaction.query';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { RecurringTransactionCardComponent } from '../recurring-transaction-card/recurring-transaction-card.component';
import { ModalPresetsService } from '../../../shared/modal/modal-presets.service';

export class ListRecurringTransactionsModalPayload {
  constructor(public readonly budgetId: number) {}
}

@Component({
  selector: 'app-list-recurring-transactions-modal',
  templateUrl: './list-recurring-transactions-modal.html',
  styleUrls: ['./list-recurring-transactions-modal.scss'],
  imports: [
    CommonModule,
    DatePipe,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    IonCard,
    IonList,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    RecurringTransactionCardComponent,
  ],
})
export class ListRecurringTransactionsModal extends ModalContentBaseComponent<
  ListRecurringTransactionsModalPayload,
  boolean
> {
  private recurringTransactionService = inject(RecurringTransactionService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);
  private budgetSliderService = inject(BudgetSliderService);
  private modalPresetsService = inject(ModalPresetsService);

  categories = this.budgetSliderService.currentCategories;
  transactionsList = signal<RecurringTransaction[]>([]);
  hasNextPage = signal<boolean>(true);
  isFiltering = signal<boolean>(false);

  private query = new RecurringTransactionQueryImpl(null);

  groupedTransactions = computed(() => {
    const transactions = this.transactionsList();
    const groups = new Map<string, RecurringTransaction[]>();

    transactions.forEach((t) => {
      const date = new Date(t.nextDate);
      const dateKey = date.toDateString();

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(t);
    });

    return Array.from(groups.entries()).map(([dateLabel, items]) => ({
      dateLabel,
      dateObj: items[0].nextDate,
      items,
    }));
  });

  constructor() {
    super();

    addIcons({ filter, funnel, cashOutline });

    effect(() => {
      const payload = this.payload();

      if (ObjectUtils.isNil(payload)) {
        return;
      }

      this.query.budgetId = payload.budgetId;
      void this.onFilterChange();
    });
  }

  async onFilterChange(): Promise<void> {
    this.query.page.pageNumber = 0;
    this.transactionsList.set([]);
    await this.fetchTransactions();
  }

  async fetchTransactions(): Promise<void> {
    const resp = await this.recurringTransactionService.search(this.query);

    if (resp.isSuccess && resp.response) {
      const pageData = resp.response;
      this.transactionsList.update((current) => [
        ...current,
        ...pageData.content,
      ]);

      this.hasNextPage.set(
        pageData.page.totalPages - 1 > this.query.page.pageNumber,
      );

      this.isFiltering.set(!!this.query.type || !!this.query.amount);
    } else {
      console.error('Failed to load recurring transactions', resp.errors);
    }
  }

  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    this.query.page.pageNumber += 1;
    await this.fetchTransactions();
    void event.target.complete();
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.onFilterChange();
    void event.target.complete();
  }

  getCategoryName(categoryId: number): string | undefined {
    return this.categories().find((c) => c.id === categoryId)?.categoryName;
  }

  async onTransactionClick(transaction: RecurringTransaction): Promise<void> {
    const maybeRTransaction =
      await this.modalPresetsService.openRecurringTransactionDetails(
        transaction,
        this.getCategoryName(transaction.categoryId) || '',
      );

    if (!ObjectUtils.isNil(maybeRTransaction)) {
      await this.onFilterChange();
      this.setDismissalData(true);
    }
  }

  async presentFilterOptions(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter Upcoming Transactions',
      buttons: [
        {
          text: `Type: ${this.query.type || 'All'}`,
          icon: 'filter',
          handler: (): void => {
            void this.presentTypeFilterSheet();
          },
        },
        {
          text: 'Amount Range',
          icon: 'cash-outline',
          handler: (): void => {
            void this.presentAmountFilterAlert();
          },
        },
        {
          text: 'Clear Filters',
          role: 'destructive',
          handler: (): void => {
            this.query.type = null;
            this.query.amount = null;
            void this.onFilterChange();
          },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  async presentTypeFilterSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter by Type',
      buttons: [
        { text: 'All', handler: (): void => this.applyTypeFilter(null) },
        {
          text: 'Expense',
          handler: (): void => this.applyTypeFilter(TransactionType.EXPENSE),
        },
        {
          text: 'Income',
          handler: (): void => this.applyTypeFilter(TransactionType.INCOME),
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await actionSheet.present();
  }

  async presentAmountFilterAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Filter by Amount',
      inputs: [
        {
          name: 'min',
          type: 'number',
          placeholder: 'Min Amount',
          value: this.query.amount?.min,
        },
        {
          name: 'max',
          type: 'number',
          placeholder: 'Max Amount',
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
            void this.onFilterChange();
          },
        },
      ],
    });
    await alert.present();
  }

  private applyTypeFilter(type: TransactionType | null): void {
    this.query.type = type;
    void this.onFilterChange();
  }
}
