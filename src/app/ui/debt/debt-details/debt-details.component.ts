import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ActionSheetController,
  IonBadge,
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
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  arrowBack,
  arrowDownCircleOutline,
  arrowUpCircleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  ellipsisVertical,
  swapHorizontalOutline,
  timeOutline,
  walletOutline,
} from 'ionicons/icons';
import { Debt } from '../../../api/debt/debt';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';
import { ExecutedTransactionsComponent } from '../../transaction/executed-transactions/executed-transactions.component';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

@Component({
  selector: 'app-debt-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    ExecutedTransactionsComponent,
  ],
  templateUrl: './debt-details.component.html',
  styleUrls: ['./debt-details.component.scss'],
})
export class DebtDetailsComponent {
  protected readonly TransactionUtils = TransactionUtils;
  private actionSheetCtrl = inject(ActionSheetController);

  debt = input.required<Debt>();
  receiverStats = input<BudgetStatistics | null>(null);
  lenderStats = input<BudgetStatistics | null>(null);
  perspectiveBudgetId = input<number | null>(null);
  transactionsReloadTrigger = input<number>(0);

  navigateAway = output<void>();
  payTriggered = output<void>();
  borrowMoreTriggered = output<void>();
  transactionsUpdated = output<void>();

  selectedTransactionsBudgetId = signal<number>(-1);

  isSettled = computed(() => (this.debt().amount || 0) <= 0);

  isBorrowerPerspective = computed(() => {
    const pId = this.perspectiveBudgetId();
    return pId !== null && pId === this.debt().receiverBudgetId;
  });

  isLenderPerspective = computed(() => {
    const pId = this.perspectiveBudgetId();
    return pId !== null && pId === this.debt().lenderBudgetId;
  });

  canPerformBorrowerActions = computed(() => !this.isLenderPerspective());

  receiverBudgetName = computed(
    () =>
      this.receiverStats()?.budget?.budgetName ||
      this.debt().receiverBudget?.budgetName ||
      `Budget #${this.debt().receiverBudgetId}`,
  );

  lenderBudgetName = computed(
    () =>
      this.lenderStats()?.budget?.budgetName ||
      this.debt().lenderBudget?.budgetName ||
      `Budget #${this.debt().lenderBudgetId}`,
  );

  heroColorClass = computed(() => {
    if (this.isSettled()) {
      return 'completed';
    }
    if (this.isBorrowerPerspective()) {
      return 'expense';
    }
    if (this.isLenderPerspective()) {
      return 'income';
    }
    return '';
  });

  statusBadgeColor = computed(() => {
    if (this.isSettled()) {
      return 'success';
    }
    if (this.isBorrowerPerspective()) {
      return 'danger';
    }
    if (this.isLenderPerspective()) {
      return 'success';
    }
    return 'warning';
  });

  statusBadgeLabel = computed(() => {
    if (this.isSettled()) {
      return 'Settled';
    }
    if (this.isBorrowerPerspective()) {
      return 'Owed to Lender';
    }
    if (this.isLenderPerspective()) {
      return 'Owed to You';
    }
    return 'Active Debt';
  });

  constructor() {
    addIcons({
      arrowBack,
      ellipsisVertical,
      swapHorizontalOutline,
      checkmarkCircleOutline,
      calendarOutline,
      timeOutline,
      walletOutline,
      addCircleOutline,
      arrowDownCircleOutline,
      arrowUpCircleOutline,
    });

    effect(() => {
      const d = this.debt();
      const pId = this.perspectiveBudgetId();
      const currentSelected = this.selectedTransactionsBudgetId();

      if (
        currentSelected !== d.receiverBudgetId &&
        currentSelected !== d.lenderBudgetId
      ) {
        if (pId === d.lenderBudgetId) {
          this.selectedTransactionsBudgetId.set(d.lenderBudgetId);
        } else {
          this.selectedTransactionsBudgetId.set(d.receiverBudgetId);
        }
      }
    });
  }

  onBudgetSegmentChange(event: CustomEvent): void {
    const val = Number(event.detail.value);
    if (!Number.isNaN(val) && val > 0) {
      this.selectedTransactionsBudgetId.set(val);
    }
  }

  async presentActionSheet(): Promise<void> {
    if (!this.canPerformBorrowerActions()) {
      return;
    }

    const buttons = [];

    if (!this.isSettled()) {
      buttons.push({
        text: 'Pay Debt',
        icon: 'checkmark-circle-outline',
        handler: (): void => {
          this.payTriggered.emit();
        },
      });
    }

    buttons.push(
      {
        text: 'Borrow More Funds',
        icon: 'add-circle-outline',
        handler: (): void => {
          this.borrowMoreTriggered.emit();
        },
      },
      {
        text: 'Cancel',
        role: 'cancel',
      },
    );

    const sheet = await this.actionSheetCtrl.create({
      header: `${this.lenderBudgetName()} lends to ${this.receiverBudgetName()}`,
      buttons,
    });

    await sheet.present();
  }
}
