import { Component, computed, inject, input, output } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  PercentPipe,
} from '@angular/common';
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
  IonNote,
  IonProgressBar,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBack,
  calculatorOutline,
  calendarOutline,
  cardOutline,
  chatboxOutline,
  checkmarkCircleOutline,
  createOutline,
  ellipsisVertical,
  flagOutline,
  flashOutline,
  folderOpenOutline,
  layersOutline,
  openOutline,
  playOutline,
  pricetagOutline,
  repeatOutline,
  syncOutline,
  timeOutline,
} from 'ionicons/icons';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { FieldError } from '../../../shared/field-error/field-error';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { RecurringTransactionCardComponent } from '../../recurring-transaction/recurring-transaction-card/recurring-transaction-card.component';

@Component({
  selector: 'app-prepayment-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
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
    IonProgressBar,
    IonNote,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonText,
    ErrorMessageComponent,
    RecurringTransactionCardComponent,
  ],
  templateUrl: './prepayment-details.component.html',
  styleUrls: ['./prepayment-details.component.scss'],
})
export class PrepaymentDetailsComponent {
  protected readonly RRuleUtils = RRuleUtils;
  protected readonly ObjectUtils = ObjectUtils;
  protected readonly TransactionUtils = TransactionUtils;
  private actionSheetCtrl = inject(ActionSheetController);

  prepayment = input.required<Prepayment>();
  recurringTransaction = input<RecurringTransaction | null>(null);
  categoryName = input<string | undefined>(undefined);
  errors = input<FieldError[]>([]);

  navigateAway = output<void>();
  editTriggered = output<void>();
  payTriggered = output<void>();
  recurringTransactionClicked = output<RecurringTransaction>();

  paidAmount = computed(() => {
    const p = this.prepayment();
    return Math.max(0, (p.amount || 0) - (p.remainingAmount || 0));
  });

  paidPercentage = computed(() => {
    const p = this.prepayment();
    if (!p.amount || p.amount <= 0) {
      return p.completed ? 1 : 0;
    }
    return Math.min(1, Math.max(0, this.paidAmount() / p.amount));
  });

  nextInstallmentAmount = computed(() => {
    const p = this.prepayment();
    const r = this.recurringTransaction();
    if (!r) {
      return 0;
    }
    return Math.min(p.remainingAmount, r.amount);
  });

  canPay = computed(() => {
    const p = this.prepayment();
    const r = this.recurringTransaction();
    return !p.completed && !!r && !r.completed && p.remainingAmount > 0;
  });

  constructor() {
    addIcons({
      arrowBack,
      ellipsisVertical,
      createOutline,
      calendarOutline,
      layersOutline,
      checkmarkCircleOutline,
      playOutline,
      cardOutline,
      folderOpenOutline,
      repeatOutline,
      flagOutline,
      syncOutline,
      calculatorOutline,
      pricetagOutline,
      chatboxOutline,
      flashOutline,
      timeOutline,
      openOutline,
    });
  }

  async presentActionSheet(): Promise<void> {
    const buttons: any[] = [
      {
        text: 'Edit Prepayment',
        icon: 'create-outline',
        handler: (): void => this.editTriggered.emit(),
      },
    ];

    if (this.canPay()) {
      buttons.push({
        text: 'Pay Next Installment',
        icon: 'play-outline',
        handler: (): void => this.payTriggered.emit(),
      });
    }

    const rTx = this.recurringTransaction();
    if (rTx) {
      buttons.push({
        text: 'Open Recurring Schedule Details',
        icon: 'repeat-outline',
        handler: (): void => this.recurringTransactionClicked.emit(rTx),
      });
    }

    buttons.push({
      text: 'Cancel',
      role: 'cancel',
      data: { action: 'cancel' },
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Prepayment Options',
      buttons,
    });
    await actionSheet.present();
  }
}
