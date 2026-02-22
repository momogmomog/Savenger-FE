import { Component, model, OnInit } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { RecurringTransactionDetailsComponent } from '../recurring-transaction-details/recurring-transaction-details.component';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import {
  RecurringTransactionExecutionModal,
  RecurringTransactionExecutionModalPayload,
} from '../recurring-transaction-execution-modal/recurring-transaction-execution.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { EditRecurringTransactionModal } from '../edit-recurring-transaction-modal/edit-recurring-transaction.modal';
import { EditRecurringTransactionModalPayload } from '../edit-recurring-transaction-modal/edit-recurring-transaction.modal.payload';

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
        (navigateAway)="dismiss()"
        (editTriggered)="onEdit()"
        (executeTriggered)="onExecute()"
        (deleteTriggered)="onDelete()"
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
    const resp = await this.modalService.openAndWait(
      RecurringTransactionExecutionModal,
      new RecurringTransactionExecutionModalPayload(this.payload().transaction),
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

  private transactionUpdated(trans: RecurringTransaction): void {
    this.setDismissalData(trans);
    this.transaction.set(trans);
    // TODO: update list of transactions when this is added.
  }
}
