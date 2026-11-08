import { Component, input, OnInit, output } from '@angular/core';
import { addIcons } from 'ionicons';
import { arrowDownCircle, arrowUpCircle, swapHorizontal } from 'ionicons/icons';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { TransactionType } from '../../../api/transaction/transaction.type';

@Component({
  selector: 'app-recurring-transaction-card',
  templateUrl: './recurring-transaction-card.component.html',
  styleUrls: ['./recurring-transaction-card.component.scss'],
  imports: [
    CurrencyPipe,
    DatePipe,
    IonIcon,
    IonItem,
    IonLabel,
    IonText,
    NgClass,
  ],
})
export class RecurringTransactionCardComponent implements OnInit {
  protected readonly RRuleUtils = RRuleUtils;

  transaction = input.required<RecurringTransaction>();
  categoryName = input<string | undefined>(undefined);
  onClick = output<RecurringTransaction>();

  constructor() {
    addIcons({ arrowDownCircle, arrowUpCircle, swapHorizontal });
  }

  ngOnInit(): void {}

  openAllPendingModal(): void {
    // TODO: Implement the modal opening logic here
    console.log('Open modal for all pending items');
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
        return 'danger';
      default:
        return 'medium';
    }
  }

  getSign(type: TransactionType): string {
    return type === TransactionType.EXPENSE ? '-' : '+';
  }
}
