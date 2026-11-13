import { Injectable } from '@angular/core';
import { ModalResponse, ModalService } from './modal.service';
import { RecurringTransaction } from '../../api/transaction/recurring/recurring-transaction';
import {
  RecurringTransactionDetailsModal,
  RecurringTransactionDetailsModalPayload,
} from '../../ui/recurring-transaction/recurring-transaction-details-modal/recurring-transaction-details.modal';
import { ShellType } from './shells/modal-shell.types';
import {
  ListRecurringTransactionsModal,
  ListRecurringTransactionsModalPayload,
} from '../../ui/recurring-transaction/list-recurring-transactions/list-recurring-transactions.modal';
import { Prepayment } from '../../api/prepayment/prepayment';
import {
  PrepaymentDetailsModal,
  PrepaymentDetailsModalPayload,
} from '../../ui/prepayment/prepayment-details-modal/prepayment-details.modal';
import {
  ListPrepaymentsModal,
  ListPrepaymentsModalPayload,
} from '../../ui/prepayment/list-prepayments/list-prepayments.modal';

@Injectable({ providedIn: 'root' })
export class ModalPresetsService {
  constructor(private modalService: ModalService) {}

  public async openRecurringTransactionDetails(
    transaction: RecurringTransaction,
    categoryName?: string,
  ): Promise<RecurringTransaction | null> {
    const resp = await this.modalService.openAndWait(
      RecurringTransactionDetailsModal,
      new RecurringTransactionDetailsModalPayload(transaction, categoryName),
      {
        shellType: ShellType.BLANK,
      },
    );

    return resp.result || null;
  }

  public async openListRecurringTransactions(
    budgetId: number,
  ): Promise<ModalResponse<boolean>> {
    return await this.modalService.openAndWait(
      ListRecurringTransactionsModal,
      new ListRecurringTransactionsModalPayload(budgetId),
      {
        shellType: ShellType.HEADER,
        title: 'Upcoming Transactions',
      },
    );
  }

  public async openPrepaymentDetails(
    prepaymentId: number,
    initialPrepayment?: Prepayment,
  ): Promise<Prepayment | null> {
    const resp = await this.modalService.openAndWait(
      PrepaymentDetailsModal,
      new PrepaymentDetailsModalPayload(prepaymentId, initialPrepayment),
      {
        shellType: ShellType.BLANK,
      },
    );

    return resp.result || null;
  }

  public async openListPrepayments(
    budgetId: number,
  ): Promise<ModalResponse<boolean>> {
    return await this.modalService.openAndWait(
      ListPrepaymentsModal,
      new ListPrepaymentsModalPayload(budgetId),
      {
        shellType: ShellType.HEADER,
        title: 'Prepayments',
      },
    );
  }
}
