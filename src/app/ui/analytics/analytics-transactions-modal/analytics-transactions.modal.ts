import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonCard,
  IonContent,
  IonList,
  IonText,
} from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { TransactionBasicDto } from '../../../api/transaction/dto/transaction-basic.dto';
import { Budget } from '../../../api/budget/budget';
import {
  TransactionCardComponent,
  TransactionCardItem,
} from '../../transaction/transaction-card/transaction-card.component';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { ModalService } from '../../../shared/modal/modal.service';
import {
  TransactionDetailsModal,
  TransactionDetailsModalPayload,
} from '../../transaction/transaction-details-modal/transaction-details.modal';
import { TransactionService } from '../../../api/transaction/transaction.service';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';

export class AnalyticsTransactionsModalPayload {
  constructor(
    public readonly transactions: TransactionBasicDto[],
    public readonly budget: Budget,
    public readonly categoryName?: string,
  ) {}
}

@Component({
  selector: 'app-analytics-transactions-modal',
  templateUrl: './analytics-transactions.modal.html',
  styleUrls: ['./analytics-transactions.modal.scss'],
  imports: [
    DatePipe,
    IonContent,
    IonCard,
    IonList,
    IonText,
    TransactionCardComponent,
  ],
})
export class AnalyticsTransactionsModal extends ModalContentBaseComponent<
  AnalyticsTransactionsModalPayload,
  boolean
> {
  private modalService = inject(ModalService);
  private transactionService = inject(TransactionService);
  private budgetSliderService = inject(BudgetSliderService);

  transactions = signal<TransactionCardItem[]>([]);

  groupedTransactions = computed(() =>
    TransactionUtils.groupByDate(this.transactions(), (t) => t.dateCreated),
  );

  constructor() {
    super();

    effect(() => {
      const payload = this.payload();
      if (ObjectUtils.isNil(payload)) {
        return;
      }

      const sorted = [...(payload.transactions || [])].sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime() || b.id - a.id,
      );
      this.transactions.set(sorted);
    });
  }

  getCategoryName(item: TransactionCardItem): string | undefined {
    if (item.categoryId !== undefined) {
      return this.budgetSliderService.getCategoryName(item.categoryId);
    }

    return this.payload().categoryName;
  }

  async onTransactionClick(transaction: TransactionCardItem): Promise<void> {
    const update = await this.modalService.openAndWait(
      TransactionDetailsModal,
      new TransactionDetailsModalPayload(transaction.id, this.payload().budget),
    );

    update.ifConfirmed(async (reload) => {
      if (reload) {
        this.setDismissalData(true);
        await this.refreshTransaction(transaction.id);
      }
    });
  }

  private async refreshTransaction(transactionId: number): Promise<void> {
    try {
      const updated = await this.transactionService.get(transactionId);
      this.transactions.update((list) =>
        list
          .map((t) => (t.id === transactionId ? updated : t))
          .sort(
            (a, b) =>
              new Date(b.dateCreated).getTime() -
                new Date(a.dateCreated).getTime() || b.id - a.id,
          ),
      );
    } catch {
      this.transactions.update((list) =>
        list.filter((t) => t.id !== transactionId),
      );
    }
  }
}
