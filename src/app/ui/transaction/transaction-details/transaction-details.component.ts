import { Component, computed, inject, input, output } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  ActionSheetController,
  IonAvatar,
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
  chatboxOutline,
  createOutline,
  ellipsisVertical,
  folderOpenOutline,
  personOutline,
  pricetagOutline,
  trashOutline,
  walletOutline,
} from 'ionicons/icons';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { Budget } from '../../../api/budget/budget';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { AppRoutingPath } from '../../../app-routing.path';

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

  isIncome = computed(() => {
    const t = this.transaction();
    return t.type === TransactionType.INCOME;
  });

  constructor() {
    addIcons({
      ellipsisVertical,
      calendarOutline,
      folderOpenOutline,
      walletOutline,
      personOutline,
      pricetagOutline,
      chatboxOutline,
      createOutline,
      trashOutline,
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

  protected readonly AppRoutingPath = AppRoutingPath;
}
