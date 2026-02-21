import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ActionSheetController,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
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
  calendarOutline,
  createOutline,
  ellipsisVertical,
  flashOutline,
  folderOpenOutline,
  pricetagOutline,
  repeatOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { AppRoutingPath } from '../../../app-routing.path';
import { RRuleUtils } from '../../../shared/util/rrule-utils';

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
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonCard,
    IonCardContent,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonChip,
  ],
  templateUrl: './recurring-transaction-details.component.html',
  styleUrls: ['./recurring-transaction-details.component.scss'],
})
export class RecurringTransactionDetailsComponent {
  protected readonly RRuleUtils = RRuleUtils;
  private actionSheetCtrl = inject(ActionSheetController);

  transaction = input.required<RecurringTransaction>();
  categoryName = input<string | undefined>('Uncategorized');

  navigateAway = output<void>();
  editTriggered = output<void>();
  deleteTriggered = output<void>();

  isIncome = computed(() => {
    return this.transaction().type === TransactionType.INCOME;
  });

  constructor() {
    addIcons({
      ellipsisVertical,
      calendarOutline,
      folderOpenOutline,
      walletOutline,
      pricetagOutline,
      createOutline,
      trashOutline,
      repeatOutline,
      flashOutline,
    });
  }

  async presentActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Recurring Options',
      buttons: [
        {
          text: 'Edit Recurring Transaction',
          icon: 'create-outline',
          handler: (): void => this.editTriggered.emit(),
        },
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
      ],
    });
    await actionSheet.present();
  }

  protected readonly AppRoutingPath = AppRoutingPath;
}
