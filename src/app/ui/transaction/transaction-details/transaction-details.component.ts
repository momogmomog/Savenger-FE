import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ActionSheetController,
  IonAvatar,
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
  arrowBack,
  calendarOutline,
  chatboxOutline,
  createOutline,
  ellipsisVertical,
  folderOpenOutline,
  layersOutline,
  personOutline,
  pricetagOutline,
  repeatOutline,
  swapHorizontalOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { Budget } from '../../../api/budget/budget';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';

@Component({
  selector: 'app-transaction-details',
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
    IonCardContent,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonText,
    IonChip,
  ],
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
})
export class TransactionDetailsComponent {
  private actionSheetCtrl = inject(ActionSheetController);

  transaction = input.required<TransactionDetailed>();
  budget = input.required<Budget>();

  navigateAway = output<void>();
  editTriggered = output<void>();
  deleteTriggered = output<void>();
  prepaymentClicked = output<number>();
  recurringTransactionClicked = output<number>();
  debtClicked = output<number>();

  isRecurring = computed(
    () => !ObjectUtils.isNil(this.transaction().recurringTransactionId),
  );

  isPrepayment = computed(
    () => !ObjectUtils.isNil(this.transaction().prepaymentId),
  );

  isDebt = computed(() => !ObjectUtils.isNil(this.transaction().debtId));

  debtLabel = computed(() =>
    TransactionUtils.getDebtLabel(this.transaction().type),
  );

  constructor() {
    addIcons({
      arrowBack,
      ellipsisVertical,
      calendarOutline,
      folderOpenOutline,
      walletOutline,
      personOutline,
      pricetagOutline,
      chatboxOutline,
      createOutline,
      trashOutline,
      layersOutline,
      repeatOutline,
      swapHorizontalOutline,
    });
  }

  async presentActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Transaction Options',
      buttons: [
        {
          text: 'Edit Transaction',
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

  protected readonly TransactionUtils = TransactionUtils;
}
