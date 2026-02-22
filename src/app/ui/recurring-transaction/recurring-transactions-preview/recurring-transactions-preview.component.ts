import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonIcon,
  IonList,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowDownCircle,
  arrowUpCircle,
  calendarOutline,
  chevronForward,
  eyeOutline,
  swapHorizontal,
  timeOutline,
} from 'ionicons/icons';
import { RecurringTransactionQueryImpl } from '../../../api/transaction/recurring/recurring-transaction.query';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EmptyBudget } from '../../../api/budget/budget';
import { RecurringTransactionCardComponent } from '../recurring-transaction-card/recurring-transaction-card.component';
import { ModalPresetsService } from '../../../shared/modal/modal-presets.service';
import { ObjectUtils } from '../../../shared/util/object-utils';

@Component({
  selector: 'app-recurring-transactions-preview',
  templateUrl: './recurring-transactions-preview.component.html',
  styleUrls: ['./recurring-transactions-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonCard,
    IonButton,
    IonIcon,
    IonList,
    IonText,
    ReactiveFormsModule,
    RecurringTransactionCardComponent,
  ],
})
export class RecurringTransactionsPreviewComponent implements OnInit {
  private recurringTransactionService = inject(RecurringTransactionService);
  private modalService = inject(ModalService);
  private modalPresetsService = inject(ModalPresetsService);
  private budgetSliderService = inject(BudgetSliderService);

  budgetId = input.required<number>();
  externalUpdateTrigger = input<number | null>(null);

  upcomingTransactions = signal<RecurringTransaction[]>([]);
  totalUpcomingTransactions = signal<number>(0);
  categories = this.budgetSliderService.currentCategories;

  lookAheadDateControl = new FormControl<Date>(this.getDefaultLookAhead());
  currentMaxDate = signal<Date>(this.getDefaultLookAhead());

  updateTriggered = output<void>();

  private query = new RecurringTransactionQueryImpl(null);

  constructor() {
    addIcons({
      calendarOutline,
      chevronForward,
      arrowUpCircle,
      arrowDownCircle,
      swapHorizontal,
      timeOutline,
      eyeOutline,
    });

    effect(async () => {
      const trigger = this.externalUpdateTrigger();
      if (ObjectUtils.isNil(trigger)) {
        return;
      }

      await this.refreshData();
    });

    effect(async () => {
      const bId = this.budgetId();

      if (bId === EmptyBudget.EMPTY_BUDGET_ID) {
        return;
      }

      if (bId) {
        this.query.budgetId = bId;
        await this.refreshData();
      }
    });

    this.lookAheadDateControl.valueChanges.subscribe((date) => {
      if (date) {
        this.currentMaxDate.set(date);
        this.refreshData();
      }
    });
  }

  ngOnInit(): void {}

  getDefaultLookAhead(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default 7 days
    return date;
  }

  async refreshData(): Promise<void> {
    this.query.nextDate = {
      max: this.currentMaxDate(),
    };
    this.query.page.pageSize = 3; // Limit to top 3

    const resp = await this.recurringTransactionService.search(this.query);

    if (resp.isSuccess) {
      this.upcomingTransactions.set(resp.response.content);
      this.totalUpcomingTransactions.set(resp.response.page.totalElements);
    } else {
      void this.modalService.showDangerToast(
        'Failed to load upcoming transactions',
      );
      console.error('Failed to load upcoming', resp.errors);
    }
  }

  getCategoryName(id: number): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.categoryName : 'Uncategorized';
  }

  async onTransactionClick(transaction: RecurringTransaction): Promise<void> {
    const maybeRTransaction =
      await this.modalPresetsService.openRecurringTransactionDetails(
        transaction,
        this.getCategoryName(transaction.categoryId) || '',
      );

    if (!ObjectUtils.isNil(maybeRTransaction)) {
      await this.refreshData();
      this.updateTriggered.emit();
    }
  }

  async openListRecurringTransactions(): Promise<void> {
    const resp = await this.modalPresetsService.openListRecurringTransactions(
      this.budgetId(),
    );

    resp.ifConfirmed(async (refresh) => {
      if (refresh) {
        await this.refreshData();
      }
    });
  }
}
