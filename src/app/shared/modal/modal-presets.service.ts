import { Injectable } from '@angular/core';
import { ModalResponse, ModalService } from './modal.service';
import { RecurringTransaction } from '../../api/transaction/recurring/recurring-transaction';
import { ShellType } from './shells/modal-shell.types';
import { Prepayment } from '../../api/prepayment/prepayment';
import { Debt } from '../../api/debt/debt';
import { Budget } from '../../api/budget/budget';

@Injectable({ providedIn: 'root' })
export class ModalPresetsService {
  constructor(private modalService: ModalService) {}

  public async openRecurringTransactionDetails(
    transaction: RecurringTransaction,
    categoryName?: string,
  ): Promise<RecurringTransaction | null> {
    const {
      RecurringTransactionDetailsModal,
      RecurringTransactionDetailsModalPayload,
    } = await import(
      '../../ui/recurring-transaction/recurring-transaction-details-modal/recurring-transaction-details.modal'
    );

    const resp = await this.modalService.openAndWait(
      RecurringTransactionDetailsModal,
      new RecurringTransactionDetailsModalPayload(transaction, categoryName),
      {
        shellType: ShellType.BLANK,
      },
    );

    return resp.result || null;
  }

  public async openRecurringTransactionDetailsById(
    recurringTransactionId: number,
    categoryName?: string,
  ): Promise<RecurringTransaction | null> {
    const {
      RecurringTransactionDetailsModal,
      RecurringTransactionDetailsModalPayload,
    } = await import(
      '../../ui/recurring-transaction/recurring-transaction-details-modal/recurring-transaction-details.modal'
    );

    const resp = await this.modalService.openAndWait(
      RecurringTransactionDetailsModal,
      new RecurringTransactionDetailsModalPayload(
        undefined,
        categoryName,
        recurringTransactionId,
      ),
      {
        shellType: ShellType.BLANK,
      },
    );

    return resp.result || null;
  }

  public async openListRecurringTransactions(
    budgetId: number,
  ): Promise<ModalResponse<boolean>> {
    const {
      ListRecurringTransactionsModal,
      ListRecurringTransactionsModalPayload,
    } = await import(
      '../../ui/recurring-transaction/list-recurring-transactions/list-recurring-transactions.modal'
    );

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
    const { PrepaymentDetailsModal, PrepaymentDetailsModalPayload } =
      await import(
        '../../ui/prepayment/prepayment-details-modal/prepayment-details.modal'
      );

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
    const { ListPrepaymentsModal, ListPrepaymentsModalPayload } = await import(
      '../../ui/prepayment/list-prepayments/list-prepayments.modal'
    );

    return await this.modalService.openAndWait(
      ListPrepaymentsModal,
      new ListPrepaymentsModalPayload(budgetId),
      {
        shellType: ShellType.HEADER,
        title: 'Prepayments',
      },
    );
  }

  public async openDebtDetails(
    debtId: number,
    perspectiveBudgetId?: number,
    initialDebt?: Debt,
  ): Promise<Debt | null> {
    const { DebtDetailsModal, DebtDetailsModalPayload } = await import(
      '../../ui/debt/debt-details-modal/debt-details.modal'
    );

    const resp = await this.modalService.openAndWait(
      DebtDetailsModal,
      new DebtDetailsModalPayload(debtId, perspectiveBudgetId, initialDebt),
      {
        shellType: ShellType.BLANK,
      },
    );

    return resp.result || null;
  }

  public async openTransactionDetails(
    transactionId: number,
    budget: Budget,
  ): Promise<ModalResponse<boolean>> {
    const { TransactionDetailsModal, TransactionDetailsModalPayload } =
      await import(
        '../../ui/transaction/transaction-details-modal/transaction-details.modal'
      );

    return await this.modalService.openAndWait(
      TransactionDetailsModal,
      new TransactionDetailsModalPayload(transactionId, budget),
    );
  }
}
