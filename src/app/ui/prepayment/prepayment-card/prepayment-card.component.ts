import { Component, computed, input, output } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  PercentPipe,
} from '@angular/common';
import {
  IonBadge,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonProgressBar,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmarkCircleOutline,
  layersOutline,
  timeOutline,
} from 'ionicons/icons';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

@Component({
  selector: 'app-prepayment-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    IonItem,
    IonLabel,
    IonIcon,
    IonText,
    IonBadge,
    IonProgressBar,
    IonNote,
  ],
  templateUrl: './prepayment-card.component.html',
  styleUrls: ['./prepayment-card.component.scss'],
})
export class PrepaymentCardComponent {
  protected readonly TransactionUtils = TransactionUtils;

  prepayment = input.required<Prepayment>();
  onClick = output<Prepayment>();

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

  constructor() {
    addIcons({
      layersOutline,
      checkmarkCircleOutline,
      calendarOutline,
      timeOutline,
    });
  }
}
