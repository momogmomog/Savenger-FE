import { Component, computed, inject, input, output } from '@angular/core';
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
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  calculatorOutline,
  calendarOutline,
  chatboxOutline,
  checkmarkCircleOutline,
  createOutline,
  ellipsisVertical,
  flagOutline,
  flashOutline,
  folderOpenOutline,
  layersOutline,
  playOutline,
  pricetagOutline,
  repeatOutline,
  swapHorizontalOutline,
  syncOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { ExecutedTransactionsComponent } from '../../transaction/executed-transactions/executed-transactions.component';

@Component({
  selector: 'app-recurring-transaction-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonCardContent,
    IonText,
    ExecutedTransactionsComponent,
  ],
  templateUrl: './recurring-transaction-details.component.html',
  styleUrls: ['./recurring-transaction-details.component.scss'],
})
export class RecurringTransactionDetailsComponent {
  protected readonly RRuleUtils = RRuleUtils;
  protected readonly ObjectUtils = ObjectUtils;
  protected readonly TransactionUtils = TransactionUtils;

  private actionSheetCtrl = inject(ActionSheetController);
  private budgetSliderService = inject(BudgetSliderService);

  transaction = input.required<RecurringTransaction>();
  categoryName = input<string | undefined>(undefined);
  embedded = input<boolean>(false);
  showTransactions = input<boolean>(true);
  showExecuteButton = input<boolean>(true);
  showPrepaymentLink = input<boolean>(true);
  transactionsReloadTrigger = input<unknown>(null);

  navigateAway = output<void>();
  editTriggered = output<void>();
  deleteTriggered = output<void>();
  executeTriggered = output<void>();
  prepaymentClicked = output<number>();
  transactionsUpdated = output<void>();

  resolvedCategoryName = computed(() => {
    const provided = this.categoryName();
    if (provided) {
      return provided;
    }
    const catId = this.transaction().categoryId;
    if (ObjectUtils.isNil(catId)) {
      return undefined;
    }
    return (
      this.budgetSliderService.getCategoryName(catId) || `Category #${catId}`
    );
  });

  resolvedBudgetName = computed(() => {
    const bId = this.transaction().budgetId;
    const current = this.budgetSliderService.currentBudget();
    if (current.id === bId && current.budgetName) {
      return current.budgetName;
    }
    const found = this.budgetSliderService
      .fetchedBudgets()
      .find((b) => b.id === bId);
    return found?.budgetName || `Budget #${bId}`;
  });

  humanReadableRule = computed(() =>
    RRuleUtils.toHumanReadableText(this.transaction().recurringRule),
  );

  constructor() {
    addIcons({
      arrowBack,
      ellipsisVertical,
      calendarOutline,
      folderOpenOutline,
      walletOutline,
      pricetagOutline,
      createOutline,
      trashOutline,
      repeatOutline,
      flashOutline,
      chatboxOutline,
      playOutline,
      checkmarkCircleOutline,
      syncOutline,
      flagOutline,
      calculatorOutline,
      layersOutline,
      swapHorizontalOutline,
    });
  }

  async presentActionSheet(): Promise<void> {
    const buttons: any[] = [
      {
        text: 'Edit Recurring Transaction',
        icon: 'create-outline',
        handler: (): void => this.editTriggered.emit(),
      },
    ];

    if (!this.transaction().completed) {
      buttons.push({
        text: 'Execute Now',
        icon: 'play-outline',
        handler: (): void => this.executeTriggered.emit(),
      });
    }

    buttons.push(
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash-outline',
        handler: (): void => this.deleteTriggered.emit(),
      },
      {
        text: 'Cancel',
        role: 'cancel',
        data: { action: 'cancel' },
      },
    );

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Recurring Options',
      buttons,
    });
    await actionSheet.present();
  }
}
