import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { BudgetSliderComponent } from '../../budget/budget-slider/budget-slider.component';
import {
  ActionSheetController,
  AlertController,
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
import { addIcons } from 'ionicons';
import { add, ellipsisVertical, filter, funnel, remove } from 'ionicons/icons';

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
import { TransactionRepository } from '../../../api/transaction/transaction.repository';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { DatePipe } from '@angular/common';
import {
  TransactionDetailsModal,
  TransactionDetailsModalPayload,
} from '../transaction-details-modal/transaction-details.modal';

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
  ],
})
export class ListTransactionsComponent implements OnInit {
  readonly TransactionType = TransactionType;
  budget = this.budgetSliderService.currentBudget;

  categories = this.budgetSliderService.currentCategories;
  tags = this.budgetSliderService.currentTags;

  transactionsList = signal<Transaction[]>([]);
  hasNextPage = signal<boolean>(true);
  isFiltering = signal<boolean>(false);

  groupedTransactions = computed(() => {
    const transactions = this.transactionsList();
    const groups = new Map<string, Transaction[]>();

    transactions.forEach((t) => {
      const date = new Date(t.dateCreated);
      const dateKey = date.toDateString();

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(t);
    });

    return Array.from(groups.entries()).map(([dateLabel, items]) => ({
      dateLabel,
      dateObj: items[0].dateCreated,
      items,
    }));
  });

  private readonly query: TransactionSearchQuery =
    new TransactionSearchQueryImpl(null);

  constructor(
    private budgetSliderService: BudgetSliderService,
    private transactionService: TransactionService,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController,
    private modalService: ModalService,
  ) {
    addIcons({ ellipsisVertical, add, remove, filter, funnel });

    effect(() => {
      const budget = this.budgetSliderService.currentBudget();
      if (budget.id >= 0) {
        void this.onFilterChange();
      }
    });
  }

  async ngOnInit(): Promise<void> {}

  async onFilterChange(): Promise<void> {
    this.query.budgetId = this.budget().id;
    this.query.page.pageNumber = 0;
    this.transactionsList.set([]);
    await this.fetchTransactions();
  }

  async fetchTransactions(): Promise<void> {
    const pageData = await this.transactionService.search(this.query);

    if (pageData) {
      this.transactionsList.update((current) => [
        ...current,
        ...pageData.content,
      ]);
      this.hasNextPage.set(
        pageData.page.totalPages - 1 > this.query.page.pageNumber,
      );

      this.isFiltering.set(!!this.query.type || !!this.query.amount);
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

  async openAddTransaction(type: TransactionType): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreateTransactionModal,
      new CreateTransactionModalPayload(this.budget().id, type),
      {
        shellType: ShellType.HEADER,
        title: '',
      },
    );

    resp.ifConfirmed((data): void => {
      if (data?.id) {
        void this.onFilterChange();
      }
    });
  }

  async presentFilterOptions(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Filter Transactions',
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

  getCategoryName(categoryId: number): string | undefined {
    return this.categories().find((c) => c.id === categoryId)?.categoryName;
  }

  async onTransactionClick(transaction: Transaction): Promise<void> {
    const update = await this.modalService.openAndWait(
      TransactionDetailsModal,
      new TransactionDetailsModalPayload(transaction.id, this.budget()),
    );

    update.ifConfirmed((reload) => {
      if (reload) {
        void this.onFilterChange();
      }
    });
  }

  protected readonly TransactionRepository = TransactionRepository;
}
