import { Component, model, OnInit } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { TransactionService } from '../../../api/transaction/transaction.service';
import { Budget } from '../../../api/budget/budget';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { TransactionDetailsComponent } from '../transaction-details/transaction-details.component';
import { ModalService } from '../../../shared/modal/modal.service';
import { EditTransactionModal } from '../edit-transaction-modal/edit-transaction.modal';
import { EditTransactionModalPayload } from '../edit-transaction-modal/edit-transaction.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';

export class TransactionDetailsModalPayload {
  constructor(
    public readonly transactionId: number,
    public readonly budget: Budget,
  ) {}
}

@Component({
  selector: 'app-transaction-details-modal',
  template: `
    <app-loader loaderName="transactionDetailsLoader"></app-loader>

    @if (transaction(); as trx) {
      <app-transaction-details
        [transaction]="trx"
        [budget]="payload().budget"
        (navigateAway)="dismiss()"
        (editTriggered)="onEdit()"
        (deleteTriggered)="onDelete()"
      ></app-transaction-details>
    }
  `,
  imports: [
    TransactionDetailsComponent,
    LoaderComponent,
    TransactionDetailsComponent,
  ],
})
export class TransactionDetailsModal
  extends ModalContentBaseComponent<TransactionDetailsModalPayload, boolean>
  implements OnInit
{
  transaction = model<TransactionDetailed>();

  constructor(
    private transactionService: TransactionService,
    private modalService: ModalService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    await this.loadTransaction();
  }

  @ShowLoader({ name: 'transactionDetailsLoader' })
  private async loadTransaction(): Promise<void> {
    try {
      const result = await this.transactionService.get(
        this.payload().transactionId,
      );
      this.transaction.set(result);
    } catch (e) {
      console.error('Failed to load transaction', e);
      await this.modalService.showDangerToast('Failed to load transaction');
      await this.dismiss();
    }
  }

  async onEdit(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      EditTransactionModal,
      new EditTransactionModalPayload(this.transaction()!),
      { shellType: ShellType.HEADER, title: '' },
    );

    resp.ifConfirmed(async (data) => {
      if (data?.id) {
        this.setDismissalData(true);
        this.transaction.set(await this.transactionService.get(data.id));
      }
    });
  }

  async onDelete(): Promise<void> {
    const conf = await this.modalService.prompt('Confirm deleting transaction');
    if (!conf) {
      return;
    }

    const deleted = await this.transactionService.delete(
      this.payload().transactionId,
    );

    if (!deleted) {
      void this.modalService.showDangerToast('Could not delete transaction!');
      return;
    }

    void this.dismiss(true);
  }
}
