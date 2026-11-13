import { Component, model, OnInit, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { RecurringTransactionDetailsComponent } from '../recurring-transaction-details/recurring-transaction-details.component';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { RecurringTransactionQueryImpl } from '../../../api/transaction/recurring/recurring-transaction.query';
import {
  RecurringTransactionExecutionModal,
  RecurringTransactionExecutionModalPayload,
} from '../recurring-transaction-execution-modal/recurring-transaction-execution.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { EditRecurringTransactionModal } from '../edit-recurring-transaction-modal/edit-recurring-transaction.modal';
import { EditRecurringTransactionModalPayload } from '../edit-recurring-transaction-modal/edit-recurring-transaction.modal.payload';
import {
  PrepaymentDetailsModal,
  PrepaymentDetailsModalPayload,
} from '../../prepayment/prepayment-details-modal/prepayment-details.modal';

export class RecurringTransactionDetailsModalPayload {
  constructor(
    public readonly transaction: RecurringTransaction,
    public readonly categoryName: string | undefined,
  ) {}
}

@Component({
  selector: 'app-recurring-transaction-details-modal',
  template: `
    @if (transaction(); as trx) {
      <app-recurring-transaction-details
        [transaction]="trx"
        [categoryName]="payload().categoryName"
        [transactionsReloadTrigger]="transactionsReloadTrigger()"
        (navigateAway)="dismiss()"
        (editTriggered)="onEdit()"
        (executeTriggered)="onExecute()"
        (deleteTriggered)="onDelete()"
        (prepaymentClicked)="onOpenPrepayment($event)"
        (transactionsUpdated)="onTransactionsUpdated()"
      ></app-recurring-transaction-details>
    }
  `,
  imports: [RecurringTransactionDetailsComponent],
})
export class RecurringTransactionDetailsModal
  extends ModalContentBaseComponent<
    RecurringTransactionDetailsModalPayload,
    RecurringTransaction | null
  >
  implements OnInit
{
  transaction = model<RecurringTransaction>();
  transactionsReloadTrigger = signal<number>(0);

  constructor(
    private recurringTransactionService: RecurringTransactionService,
    private modalService: ModalService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.transaction.set(this.payload().transaction);
  }

  async onEdit(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      EditRecurringTransactionModal,
      new EditRecurringTransactionModalPayload(this.transaction()!),
      { shellType: ShellType.HEADER, title: '' },
    );

    resp.ifConfirmed(async (trans) => {
      if (!ObjectUtils.isNil(trans?.id)) {
        this.transactionUpdated(trans);
      }
    });
  }

  async onDelete(): Promise<void> {
    const conf = await this.modalService.prompt(
      'Confirm deleting recurring transaction',
    );

    if (!conf) {
      return;
    }

    console.log(
      'Delete triggered for recurring transaction',
      this.transaction()?.id,
    );
    void this.dismiss(null);
  }

  async onExecute(): Promise<void> {
    const current = this.transaction();
    if (!current) {
      return;
    }

    const resp = await this.modalService.openAndWait(
      RecurringTransactionExecutionModal,
      new RecurringTransactionExecutionModalPayload(current),
      {
        shellType: ShellType.HEADER,
        title: 'Execute transaction',
      },
    );

    resp.ifConfirmed((trans) => {
      if (!ObjectUtils.isNil(trans?.id)) {
        this.transactionUpdated(trans);
      }
    });
  }

  async onOpenPrepayment(prepaymentId: number): Promise<void> {
    const resp = await this.modalService.openAndWait(
      PrepaymentDetailsModal,
      new PrepaymentDetailsModalPayload(prepaymentId),
      { shellType: ShellType.BLANK },
    );

    if (!ObjectUtils.isNil(resp.result)) {
      await this.refreshRecurringTransaction();
    }
  }

  onTransactionsUpdated(): void {
    const current = this.transaction();
    if (current) {
      this.setDismissalData(current);
    }
  }

  private async refreshRecurringTransaction(): Promise<void> {
    const current = this.transaction();
    if (!current) {
      return;
    }

    const query = new RecurringTransactionQueryImpl(current.budgetId);
    query.prepaymentId = current.prepaymentId;
    query.completed = null;

    const resp = await this.recurringTransactionService.search(query);
    if (resp.isSuccess && resp.response.content.length > 0) {
      const updated =
        resp.response.content.find((item) => item.id === current.id) ||
        resp.response.content[0];
      this.transactionUpdated(updated);
    }
  }

  private transactionUpdated(trans: RecurringTransaction): void {
    this.setDismissalData(trans);
    this.transaction.set(trans);
    this.transactionsReloadTrigger.update((v) => v + 1);
  }
}
