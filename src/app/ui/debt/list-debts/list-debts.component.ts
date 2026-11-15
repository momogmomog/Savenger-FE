import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonList,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, chevronDownOutline } from 'ionicons/icons';
import { Debt } from '../../../api/debt/debt';
import { DebtService } from '../../../api/debt/debt.service';
import { DebtQuery, DebtQueryImpl } from '../../../api/debt/debt.query';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';
import { ModalPresetsService } from '../../../shared/modal/modal-presets.service';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { EmptyBudget } from '../../../api/budget/budget';
import { DebtCardComponent } from '../debt-card/debt-card.component';

@Component({
  selector: 'app-list-debts',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonList,
    IonSpinner,
    DebtCardComponent,
  ],
  templateUrl: './list-debts.component.html',
  styleUrls: ['./list-debts.component.scss'],
})
export class ListDebtsComponent {
  private debtService = inject(DebtService);
  private modalPresetsService = inject(ModalPresetsService);

  budgetId = input.required<number>();
  debtReceivedAmount = input<number | null>(null);
  debtLendedAmount = input<number | null>(null);
  externalUpdateTrigger = input<number | null>(null);

  borrowTriggered = output<void>();
  updateTriggered = output<void>();

  isLoading = signal<boolean>(false);
  totalCount = signal<number>(0);

  pagination = new PaginatedListState<Debt>();
  debtsList = this.pagination.items;
  hasNextPage = this.pagination.hasNextPage;

  hasSummaryAmounts = computed(
    () =>
      !ObjectUtils.isNil(this.debtReceivedAmount()) ||
      !ObjectUtils.isNil(this.debtLendedAmount()),
  );

  private query: DebtQuery = new DebtQueryImpl();

  constructor() {
    addIcons({
      addCircleOutline,
      chevronDownOutline,
    });

    effect(() => {
      const trigger = this.externalUpdateTrigger();
      if (ObjectUtils.isNil(trigger)) {
        return;
      }
      void this.onFilterChange();
    });

    effect(() => {
      const bId = this.budgetId();
      if (bId === EmptyBudget.EMPTY_BUDGET_ID || bId < 0) {
        return;
      }

      this.query = new DebtQueryImpl();
      this.query.budgetIds = [bId];
      void this.onFilterChange();
    });
  }

  async onFilterChange(): Promise<void> {
    const bId = this.budgetId();
    if (bId < 0) {
      return;
    }
    this.query.budgetIds = [bId];
    this.isLoading.set(true);
    try {
      await this.pagination.reload(this.query, () => this.fetchDebts());
    } finally {
      this.isLoading.set(false);
    }
  }

  private async fetchDebts(): Promise<void> {
    const resp = await this.debtService.search(this.query);
    if (resp.isSuccess && resp.response) {
      this.totalCount.set(resp.response.page?.totalElements ?? 0);
      this.pagination.appendPage(resp.response, this.query);
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasNextPage() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    try {
      this.query.page.pageNumber += 1;
      await this.fetchDebts();
    } finally {
      this.isLoading.set(false);
    }
  }

  async onDebtClick(debt: Debt): Promise<void> {
    const updatedDebt = await this.modalPresetsService.openDebtDetails(
      debt.id,
      this.budgetId(),
      debt,
    );

    if (!ObjectUtils.isNil(updatedDebt)) {
      await this.onFilterChange();
      this.updateTriggered.emit();
    }
  }
}
