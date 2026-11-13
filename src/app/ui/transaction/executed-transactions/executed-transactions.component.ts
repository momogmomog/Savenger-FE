import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, receiptOutline } from 'ionicons/icons';
import { Transaction } from '../../../api/transaction/transaction';
import { TransactionService } from '../../../api/transaction/transaction.service';
import {
  TransactionSearchQuery,
  TransactionSearchQueryImpl,
} from '../../../api/transaction/transactionSearchQuery';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';
import { TransactionCardComponent } from '../transaction-card/transaction-card.component';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { ModalService } from '../../../shared/modal/modal.service';
import {
  TransactionDetailsModal,
  TransactionDetailsModalPayload,
} from '../transaction-details-modal/transaction-details.modal';
import { Budget } from '../../../api/budget/budget';

export enum ExecutedTransactionsRevisedFilter {
  ALL = 'ALL',
  UNREVISED = 'UNREVISED',
  REVISED = 'REVISED',
}

@Component({
  selector: 'app-executed-transactions',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonList,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonButton,
    IonIcon,
    IonText,
    IonSpinner,
    TransactionCardComponent,
  ],
  templateUrl: './executed-transactions.component.html',
  styleUrls: ['./executed-transactions.component.scss'],
})
export class ExecutedTransactionsComponent {
  readonly ExecutedTransactionsRevisedFilter =
    ExecutedTransactionsRevisedFilter;

  private transactionService = inject(TransactionService);
  protected budgetSliderService = inject(BudgetSliderService);
  private modalService = inject(ModalService);

  budgetId = input.required<number>();
  recurringTransactionId = input<number | null>(null);
  prepaymentId = input<number | null>(null);
  reloadTrigger = input<unknown>(null);
  sectionTitle = input<string>('Executed Transactions');

  transactionsUpdated = output<void>();

  revisedFilter = signal<ExecutedTransactionsRevisedFilter>(
    ExecutedTransactionsRevisedFilter.ALL,
  );
  isLoading = signal<boolean>(false);
  totalCount = signal<number>(0);

  pagination = new PaginatedListState<Transaction>();
  transactionsList = this.pagination.items;
  hasNextPage = this.pagination.hasNextPage;

  private query: TransactionSearchQuery = new TransactionSearchQueryImpl(null);

  constructor() {
    addIcons({
      receiptOutline,
      chevronDownOutline,
    });

    effect(() => {
      const bId = this.budgetId();
      const rTxId = this.recurringTransactionId();
      const prepId = this.prepaymentId();
      const revFilter = this.revisedFilter();
      this.reloadTrigger();

      if (bId >= 0 && (rTxId !== null || prepId !== null)) {
        this.syncQuery(bId, rTxId, prepId, revFilter);
        void this.reloadTransactions();
      }
    });
  }

  private syncQuery(
    budgetId: number,
    recurringTransactionId: number | null,
    prepaymentId: number | null,
    revFilter: ExecutedTransactionsRevisedFilter,
  ): void {
    this.query.budgetId = budgetId;
    this.query.recurringTransactionId = recurringTransactionId;
    this.query.prepaymentId = prepaymentId;

    if (revFilter === ExecutedTransactionsRevisedFilter.UNREVISED) {
      this.query.revised = false;
    } else if (revFilter === ExecutedTransactionsRevisedFilter.REVISED) {
      this.query.revised = true;
    } else {
      this.query.revised = null;
    }
  }

  async reloadTransactions(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.pagination.reload(this.query, () => this.fetchPage());
    } finally {
      this.isLoading.set(false);
    }
  }

  private async fetchPage(): Promise<void> {
    const pageData = await this.transactionService.search(this.query);
    if (pageData) {
      this.totalCount.set(pageData.page?.totalElements ?? 0);
      this.pagination.appendPage(pageData, this.query);
    }
  }

  async loadMorePage(): Promise<void> {
    if (!this.hasNextPage() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    try {
      this.query.page.pageNumber += 1;
      await this.fetchPage();
    } finally {
      this.isLoading.set(false);
    }
  }

  onRevisedSegmentChange(event: CustomEvent): void {
    const val = event.detail.value as ExecutedTransactionsRevisedFilter;
    if (val) {
      this.revisedFilter.set(val);
    }
  }

  private resolveBudget(): Budget {
    const bId = this.budgetId();
    const current = this.budgetSliderService.currentBudget();
    if (current.id === bId) {
      return current;
    }
    return (
      this.budgetSliderService.fetchedBudgets().find((b) => b.id === bId) ||
      current
    );
  }

  async onTransactionClick(transaction: Transaction): Promise<void> {
    const resp = await this.modalService.openAndWait(
      TransactionDetailsModal,
      new TransactionDetailsModalPayload(transaction.id, this.resolveBudget()),
    );

    resp.ifConfirmed(async (reload) => {
      if (reload) {
        await this.reloadTransactions();
        this.transactionsUpdated.emit();
      }
    });
  }
}
