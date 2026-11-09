import { Component, effect } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { TransfersModalPayload } from './transfers.modal.payload';
import { TransferService } from '../../../api/transfer/transfer.service';
import { Transfer } from '../../../api/transfer/transfer';
import {
  TransferQuery,
  TransferQueryImpl,
} from '../../../api/transfer/transfer.query';
import {
  InfiniteScrollCustomEvent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { ModalService } from '../../../shared/modal/modal.service';
import { TransferCardComponent } from '../transfer-card/transfer-card.component';
import { addIcons } from 'ionicons';
import { add, close } from 'ionicons/icons';
import { CreateTransferModalComponent } from '../create-transfer-modal/create-transfer-modal.component';
import { CreateTransferModalPayload } from '../create-transfer-modal/create-transfer-modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { CreateTransferTransactionModalComponent } from '../../transfer-transaction/create-transfer-transaction-modal/create-transfer-transaction-modal.component';
import { CreateTransferTransactionModalPayload } from '../../transfer-transaction/create-transfer-transaction-modal/create-transfer-transaction-modal.payload';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';

@Component({
  templateUrl: './transfers.modal.html',
  imports: [
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    TransferCardComponent,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class TransfersModal extends ModalContentBaseComponent<
  TransfersModalPayload,
  boolean
> {
  pagination = new PaginatedListState<Transfer>();
  transfers = this.pagination.items;

  query: TransferQuery = new TransferQueryImpl(null);
  hasNextPage = this.pagination.hasNextPage;

  constructor(
    private transferService: TransferService,
    private modalService: ModalService,
  ) {
    super();
    addIcons({ add, close });

    effect(async () => {
      this.query.sourceBudgetId = this.payload().budget.id;
      await this.onFilterChange();
    });
  }

  async onFilterChange(): Promise<void> {
    await this.pagination.reload(this.query, () => this.fetchTransfers());
  }

  async fetchTransfers(): Promise<void> {
    const resp = await this.transferService.searchTransfers(this.query);

    if (!resp.isSuccess) {
      console.error(resp);
      void this.modalService.showDangerToast('Could not load transfers!');
      return;
    }

    this.pagination.appendPage(resp.response, this.query);
  }

  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    await this.pagination.loadMore(event, this.query, () =>
      this.fetchTransfers(),
    );
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.pagination.handleRefresh(event, () => this.onFilterChange());
  }

  onTransferClick(transfer: Transfer): void {
    console.log('Transfer card clicked:', transfer);
  }

  async onCreateTransfer(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreateTransferModalComponent,
      new CreateTransferModalPayload(this.payload().budget),
      {
        shellType: ShellType.HEADER,
        title: 'Create Transfer',
      },
    );

    resp.ifConfirmed((transfer) => {
      if (transfer?.id) {
        this.onFilterChange();
      }
    });
  }

  async onTransferArchive(transfer: Transfer): Promise<void> {
    const conf = await this.modalService.prompt(
      'Do you want to hide this transfer?',
      'Yes',
    );

    if (conf) {
      await this.transferService.deleteTransfer(transfer.id);
      await this.onFilterChange();
    }
  }

  async onPerformTransfer(transfer: Transfer): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreateTransferTransactionModalComponent,
      new CreateTransferTransactionModalPayload(transfer),
      {
        shellType: ShellType.HEADER,
        title: 'Create Transfer Transaction',
      },
    );

    resp.ifConfirmed(async (transfer) => {
      if (transfer?.transferTransactionId) {
        this.setDismissalData(true);
        await this.onFilterChange();
      }
    });
  }

  onViewDetails(transfer: Transfer): void {
    console.log(transfer);
    alert('To be implemented');
  }
}
