import { Component, model, OnInit } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { RecurringTransactionDetailsComponent } from '../recurring-transaction-details/recurring-transaction-details.component';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';

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
    // TODO: Create and implement EditRecurringTransactionModal
    /*
    const resp = await this.modalService.openAndWait(
      EditRecurringTransactionModal,
      new EditRecurringTransactionModalPayload(this.transaction()!),
      { shellType: ShellType.HEADER, title: '' },
    );

    resp.ifConfirmed(async (data) => {
      if (data?.id) {
        this.setDismissalData(true);
        // Refresh local transaction state if needed
      }
    });
    */
    console.log(
      'Edit triggered for recurring transaction',
      this.transaction()?.id,
    );
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
}
