import { Component, input, OnInit, output } from '@angular/core';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { IonIcon, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { TransactionUtils } from '../../../shared/util/transaction-utils';

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
  protected readonly TransactionUtils = TransactionUtils;

  transaction = input.required<RecurringTransaction>();
  categoryName = input<string | undefined>(undefined);
  onClick = output<RecurringTransaction>();

  ngOnInit(): void {}

  openAllPendingModal(): void {
    // TODO: Implement the modal opening logic here
    console.log('Open modal for all pending items');
  }
}
