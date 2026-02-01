import {
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
  IonSpinner,
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
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service'; // Adjust path
import { TransactionType } from '../../../api/transaction/transaction.type';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';

@Component({
  selector: 'app-recurring-transactions-preview',
  templateUrl: './recurring-transactions-preview.component.html',
  styleUrls: ['./recurring-transactions-preview.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonList,
    IonText,
    IonSpinner,
    IonPopover,
    DatePickerComponent,
    ReactiveFormsModule,
    DatePickerComponent,
  ],
})
export class RecurringTransactionsPreviewComponent implements OnInit {
  private recurringTransactionService = inject(RecurringTransactionService);
  private modalService = inject(ModalService);
  private budgetSliderService = inject(BudgetSliderService);

  budgetId = input.required<number>();

  // State
  upcomingTransactions = signal<RecurringTransaction[]>([]);
  isLoading = signal<boolean>(false);
  categories = this.budgetSliderService.currentCategories;

  // Filter Logic
  lookAheadDateControl = new FormControl<Date>(this.getDefaultLookAhead());
  currentMaxDate = signal<Date>(this.getDefaultLookAhead());

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

    // 1. Effect to handle Budget ID changes
    effect(
      async () => {
        const bId = this.budgetId();
        if (bId) {
          this.query.budgetId = bId;
          await this.refreshData();
        }
      },
      { allowSignalWrites: true },
    );

    // 2. Effect to handle Date Filter changes
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
    this.isLoading.set(true);
    try {
      this.query.nextDate = {
        max: this.currentMaxDate(),
      };
      this.query.page.pageSize = 3; // Limit to top 3

      const resp = await this.recurringTransactionService.search(this.query);

      if (resp.isSuccess) {
        this.upcomingTransactions.set(resp.response.content);
      } else {
        // Silent fail or minimal toast in a widget context
        console.error('Failed to load upcoming', resp.errors);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  openAllPendingModal(): void {
    // TODO: Implement the modal opening logic here
    // This would likely open a modal listing ALL recurring transactions
    // passing the budgetId.
    console.log('Open modal for all pending items');
    // Example:
    // this.modalService.open(RecurringTransactionsListModal, ...);
  }

  // Helpers for UI (mimicking TransactionCardComponent)
  getCategoryName(id: number): string {
    const cat = this.categories().find((c) => c.id === id);
    return cat ? cat.categoryName : 'Uncategorized';
  }

  getIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'arrow-down-circle';
      case TransactionType.EXPENSE:
        return 'arrow-up-circle';
      default:
        return 'swap-horizontal';
    }
  }

  getColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'success';
      case TransactionType.EXPENSE:
        return 'danger'; // Using danger for expenses in preview to highlight urgency
      default:
        return 'medium';
    }
  }

  getSign(type: TransactionType): string {
    return type === TransactionType.EXPENSE ? '-' : '+';
  }
}
