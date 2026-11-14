import { Component, model, OnInit, signal } from '@angular/core';
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
import {
  PrepaymentDetailsModal,
  PrepaymentDetailsModalPayload,
} from '../../prepayment/prepayment-details-modal/prepayment-details.modal';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';

export class RecurringTransactionDetailsModalPayload {
  constructor(
    public readonly transaction: RecurringTransaction | undefined,
    public readonly categoryName?: string | undefined,
    public readonly recurringTransactionId?: number,
  ) {}
}

@Component({
  selector: 'app-recurring-transaction-details-modal',
  template: `
    <app-loader loaderName="recurringTransactionDetailsLoader"></app-loader>

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
  imports: [RecurringTransactionDetailsComponent, LoaderComponent],
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

  async ngOnInit(): Promise<void> {
    if (this.payload().transaction) {
      this.transaction.set(this.payload().transaction);
      return;
    }

    const id = this.payload().recurringTransactionId;
    if (!ObjectUtils.isNil(id)) {
      await this.loadRecurringTransaction(id!);
    }
  }

  @ShowLoader({ name: 'recurringTransactionDetailsLoader' })
  private async loadRecurringTransaction(id: number): Promise<void> {
    const resp = await this.recurringTransactionService.get(id);
    if (!resp.isSuccess || !resp.response) {
      await this.modalService.showDangerToast(
        'Failed to load recurring transaction',
      );
      await this.dismiss();
      return;
    }

    this.transaction.set(resp.response);
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

    const resp = await this.recurringTransactionService.get(current.id);
    if (resp.isSuccess && resp.response) {
      this.transactionUpdated(resp.response);
    }
  }

  private transactionUpdated(trans: RecurringTransaction): void {
    this.setDismissalData(trans);
    this.transaction.set(trans);
    this.transactionsReloadTrigger.update((v) => v + 1);
  }
}
