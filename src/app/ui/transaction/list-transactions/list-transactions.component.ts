import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';
import {
  ActionSheetController,
  InfiniteScrollCustomEvent,
  IonButton,
  IonButtons,
  IonCard,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonTitle,
  IonToolbar,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  ellipsisHorizontalOutline,
  ellipsisVertical,
  layersOutline,
  repeatOutline,
  swapHorizontalOutline,
  timeOutline,
} from 'ionicons/icons';

import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { TransactionService } from '../../../api/transaction/transaction.service';
import {
  TransactionSearchQuery,
  TransactionSearchQueryImpl,
} from '../../../api/transaction/transactionSearchQuery';
import { Transaction } from '../../../api/transaction/transaction';
import { ModalService } from '../../../shared/modal/modal.service';
import { CreateTransactionModal } from '../create-transaction-modal/create-transaction.modal';
import { CreateTransactionModalPayload } from '../create-transaction-modal/create-transaction.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { DatePipe } from '@angular/common';
import {
  TransactionDetailsModal,
  TransactionDetailsModalPayload,
} from '../transaction-details-modal/transaction-details.modal';
import { TransfersModal } from '../../transfer/transfers-modal/transfers.modal';
import { TransfersModalPayload } from '../../transfer/transfers-modal/transfers.modal.payload';
import { CreateRecurringTransactionModal } from '../../recurring-transaction/create-recurring-transaction-modal/create-recurring-transaction.modal';
import { CreateRecurringTransactionModalPayload } from '../../recurring-transaction/create-recurring-transaction-modal/create-recurring-transaction.modal.payload';
import { RecurringTransactionsPreviewComponent } from '../../recurring-transaction/recurring-transactions-preview/recurring-transactions-preview.component';
import { ModalPresetsService } from '../../../shared/modal/modal-presets.service';
import { TransactionFilterModalComponent } from '../transaction-filter-modal/transaction-filter-modal.component';
import { TransactionFilterModalResult } from '../transaction-filter-modal/transaction-filter-modal.payload';
import { TransactionFilterState } from '../transaction-filter-modal/transaction-filter.state';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';
import { CreatePrepaymentModal } from '../../prepayment/create-prepayment-modal/create-prepayment.modal';
import { CreatePrepaymentModalPayload } from '../../prepayment/create-prepayment-modal/create-prepayment.modal.payload';

@Component({
  selector: 'app-list-transactions',
  templateUrl: './list-transactions.component.html',
  styleUrls: ['./list-transactions.component.scss'],
  imports: [
    BudgetSliderComponent,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonTitle,
    IonToolbar,
    TransactionCardComponent,
    IonText,
    DatePipe,
    IonCard,
    RecurringTransactionsPreviewComponent,
  ],
})
export class ListTransactionsComponent implements OnInit {
  readonly TransactionType = TransactionType;
  protected readonly TransactionUtils = TransactionUtils;
  budget = this.budgetSliderService.currentBudget;
  recurringTransactionUpdateTrigger = signal<number | null>(null);

  pagination = new PaginatedListState<Transaction>();
  transactionsList = this.pagination.items;
  hasNextPage = this.pagination.hasNextPage;
  filterState = new TransactionFilterState();
  isFiltering = this.filterState.isFiltering;

  groupedTransactions = computed(() =>
    TransactionUtils.groupByDate(this.transactionsList(), (t) => t.dateCreated),
  );

  private query: TransactionSearchQuery = new TransactionSearchQueryImpl(null);

  constructor(
    protected budgetSliderService: BudgetSliderService,
    private transactionService: TransactionService,
    private actionSheetCtrl: ActionSheetController,
    private modalService: ModalService,
    private modalPresetsService: ModalPresetsService,
  ) {
    addIcons({
      ellipsisVertical,
      ellipsisHorizontalOutline,
      swapHorizontalOutline,
      calendarOutline,
      repeatOutline,
      layersOutline,
      timeOutline,
    });

    effect(() => {
      const budget = this.budgetSliderService.currentBudget();
      if (budget.id >= 0) {
        this.query = new TransactionSearchQueryImpl(null);
        this.filterState.clear();
        void this.onFilterChange();
      }
    });
  }

  async ngOnInit(): Promise<void> {}

  async onFilterChange(): Promise<void> {
    this.query.budgetId = this.budget().id;
    await this.pagination.reload(this.query, () => this.fetchTransactions());
  }

  async fetchTransactions(): Promise<void> {
    const pageData = await this.transactionService.search(this.query);

    if (pageData) {
      this.pagination.appendPage(pageData, this.query);
      this.filterState.syncWithQuery(this.query);
    }
  }

  async transactionsChanged(): Promise<void> {
    await Promise.all([
      this.budgetSliderService.refreshStatistic(this.budget().id),
      this.onFilterChange(),
    ]);
  }

  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    await this.pagination.loadMore(event, this.query, () =>
      this.fetchTransactions(),
    );
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.pagination.handleRefresh(event, () =>
      this.transactionsChanged(),
    );
  }

  async openAddTransaction(type: TransactionType): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreateTransactionModal,
      new CreateTransactionModalPayload(this.budget().id, type),
      {
        shellType: ShellType.HEADER,
        title: '',
      },
    );

    resp.ifConfirmed(async (data): Promise<void> => {
      if (data?.id) {
        await this.transactionsChanged();
      }
    });
  }

  async openTransfers(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      TransfersModal,
      new TransfersModalPayload(this.budget()),
      {
        shellType: ShellType.HEADER,
        title: 'Available Transfers',
      },
    );

    resp.ifConfirmed(async (refresh): Promise<void> => {
      if (refresh) {
        await this.transactionsChanged();
      }
    });
  }

  async showMoreTransactionOptions(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'More Options',
      buttons: [
        {
          text: 'View Upcoming Transactions',
          icon: 'time-outline',
          handler: async (): Promise<void> => {
            const resp =
              await this.modalPresetsService.openListRecurringTransactions(
                this.budget().id,
              );

            resp.ifConfirmed(async (refresh) => {
              if (refresh) {
                await this.transactionsChanged();
                this.recurringTransactionUpdateTrigger.update(
                  (value) => (value || 0) + 1,
                );
              }
            });
          },
        },
        {
          text: 'Prepayments',
          icon: 'layers-outline',
          handler: async (): Promise<void> => {
            const resp = await this.modalPresetsService.openListPrepayments(
              this.budget().id,
            );

            resp.ifConfirmed(async (refresh) => {
              if (refresh) {
                await this.transactionsChanged();
                this.recurringTransactionUpdateTrigger.update(
                  (value) => (value || 0) + 1,
                );
              }
            });
          },
        },
        {
          text: 'Create Prepayment',
          icon: 'calendar-outline',
          handler: async (): Promise<void> => {
            const resp = await this.modalService.openAndWait(
              CreatePrepaymentModal,
              new CreatePrepaymentModalPayload(this.budget().id),
              {
                shellType: ShellType.HEADER,
                title: 'Create Prepayment',
              },
            );

            resp.ifConfirmed(async (data): Promise<void> => {
              if (data?.id) {
                await this.transactionsChanged();
                this.recurringTransactionUpdateTrigger.update(
                  (c) => (c || 0) + 1,
                );
              }
            });
          },
        },
        {
          text: 'Recurring Transaction',
          icon: 'repeat-outline',
          handler: async (): Promise<void> => {
            const resp = await this.modalService.openAndWait(
              CreateRecurringTransactionModal,
              new CreateRecurringTransactionModalPayload(this.budget().id),
              {
                shellType: ShellType.HEADER,
                title: '',
              },
            );

            resp.ifConfirmed(async (data): Promise<void> => {
              if (data?.id) {
                await this.transactionsChanged();
                this.recurringTransactionUpdateTrigger.update(
                  (c) => (c || 0) + 1,
                );
              }
            });
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: { action: 'cancel' },
        },
      ],
    });
    await actionSheet.present();
  }

  async presentFilterOptions(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      TransactionFilterModalComponent,
      this.filterState.toModalPayload(this.budget().id, this.query),
      {
        shellType: ShellType.HEADER,
        title: 'Filter Transactions',
      },
    );

    resp.ifConfirmed((result: TransactionFilterModalResult) => {
      this.filterState.applyFilterResult(this.query, result);
      void this.onFilterChange();
    });
  }

  async onTransactionClick(transaction: Transaction): Promise<void> {
    const update = await this.modalService.openAndWait(
      TransactionDetailsModal,
      new TransactionDetailsModalPayload(transaction.id, this.budget()),
    );

    update.ifConfirmed(async (reload) => {
      if (reload) {
        await this.transactionsChanged();
      }
    });
  }
}
