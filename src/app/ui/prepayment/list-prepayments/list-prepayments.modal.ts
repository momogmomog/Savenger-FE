import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonCard,
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonLabel,
  IonList,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  checkmarkCircleOutline,
  filter,
  funnel,
  layersOutline,
  timeOutline,
} from 'ionicons/icons';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { PrepaymentService } from '../../../api/prepayment/prepayment.service';
import {
  PrepaymentQuery,
  PrepaymentQueryImpl,
} from '../../../api/prepayment/prepayment.query';
import { PaginatedListState } from '../../../shared/util/paginated-list.state';
import { TransactionUtils } from '../../../shared/util/transaction-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { ModalService } from '../../../shared/modal/modal.service';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { PrepaymentCardComponent } from '../prepayment-card/prepayment-card.component';
import {
  PrepaymentDetailsModal,
  PrepaymentDetailsModalPayload,
} from '../prepayment-details-modal/prepayment-details.modal';
import { CreatePrepaymentModal } from '../create-prepayment-modal/create-prepayment.modal';
import { CreatePrepaymentModalPayload } from '../create-prepayment-modal/create-prepayment.modal.payload';
import { PrepaymentFilterModalComponent } from '../prepayment-filter-modal/prepayment-filter-modal.component';
import {
  PrepaymentFilterModalPayload,
  PrepaymentFilterModalResult,
} from '../prepayment-filter-modal/prepayment-filter-modal.payload';

export class ListPrepaymentsModalPayload {
  constructor(public readonly budgetId: number) {}
}

export type PrepaymentTabStatus = 'ACTIVE' | 'COMPLETED' | 'ALL';

@Component({
  selector: 'app-list-prepayments-modal',
  templateUrl: './list-prepayments.modal.html',
  styleUrls: ['./list-prepayments.modal.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonButton,
    IonIcon,
    IonCard,
    IonList,
    IonText,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFab,
    IonFabButton,
    PrepaymentCardComponent,
  ],
})
export class ListPrepaymentsModal extends ModalContentBaseComponent<
  ListPrepaymentsModalPayload,
  boolean
> {
  protected readonly TransactionUtils = TransactionUtils;
  private prepaymentService = inject(PrepaymentService);
  private modalService = inject(ModalService);

  pagination = new PaginatedListState<Prepayment>();
  prepaymentsList = this.pagination.items;
  hasNextPage = this.pagination.hasNextPage;

  selectedTab = signal<PrepaymentTabStatus>('ACTIVE');
  isFiltering = signal<boolean>(false);
  totalCount = signal<number>(0);

  query: PrepaymentQuery = new PrepaymentQueryImpl(null);

  constructor() {
    super();

    addIcons({
      add,
      layersOutline,
      checkmarkCircleOutline,
      timeOutline,
      filter,
      funnel,
    });

    effect(() => {
      const payload = this.payload();
      if (ObjectUtils.isNil(payload)) {
        return;
      }

      this.query.budgetId = payload.budgetId;
      void this.onFilterChange();
    });
  }

  async onFilterChange(): Promise<void> {
    await this.pagination.reload(this.query, () => this.fetchPrepayments());
  }

  async fetchPrepayments(): Promise<void> {
    const resp = await this.prepaymentService.search(this.query);

    if (resp.isSuccess && resp.response) {
      this.pagination.appendPage(resp.response, this.query);
      this.totalCount.set(resp.response.page.totalElements);
      this.syncFilterStatus();
    } else {
      console.error('Failed to load prepayments', resp.errors);
      void this.modalService.showDangerToast('Failed to load prepayments');
    }
  }

  private syncFilterStatus(): void {
    this.isFiltering.set(
      !!this.query.name ||
        !!this.query.amount ||
        !!this.query.remainingAmount ||
        !!this.query.paidUntil,
    );

    if (this.query.completed === false) {
      this.selectedTab.set('ACTIVE');
    } else if (this.query.completed === true) {
      this.selectedTab.set('COMPLETED');
    } else {
      this.selectedTab.set('ALL');
    }
  }

  onTabChange(event: CustomEvent): void {
    const tab = event.detail.value as PrepaymentTabStatus;
    this.selectedTab.set(tab);

    if (tab === 'ACTIVE') {
      this.query.completed = false;
    } else if (tab === 'COMPLETED') {
      this.query.completed = true;
    } else {
      this.query.completed = null;
    }

    void this.onFilterChange();
  }

  async loadMore(event: InfiniteScrollCustomEvent): Promise<void> {
    await this.pagination.loadMore(event, this.query, () =>
      this.fetchPrepayments(),
    );
  }

  async handleRefresh(event: RefresherCustomEvent): Promise<void> {
    await this.pagination.handleRefresh(event, () => this.onFilterChange());
  }

  async presentFilterModal(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      PrepaymentFilterModalComponent,
      new PrepaymentFilterModalPayload(this.query),
      {
        shellType: ShellType.HEADER,
        title: 'Filter Prepayments',
      },
    );

    resp.ifConfirmed((result: PrepaymentFilterModalResult) => {
      if (result?.query) {
        Object.assign(this.query, result.query);
        void this.onFilterChange();
      }
    });
  }

  async onPrepaymentClick(prepayment: Prepayment): Promise<void> {
    const resp = await this.modalService.openAndWait(
      PrepaymentDetailsModal,
      new PrepaymentDetailsModalPayload(prepayment.id, prepayment),
      {
        shellType: ShellType.BLANK,
      },
    );

    if (!ObjectUtils.isNil(resp.result)) {
      await this.onFilterChange();
      this.setDismissalData(true);
    }
  }

  async onCreatePrepayment(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      CreatePrepaymentModal,
      new CreatePrepaymentModalPayload(this.payload().budgetId),
      {
        shellType: ShellType.HEADER,
        title: 'Create Prepayment',
      },
    );

    resp.ifConfirmed(async (created) => {
      if (created?.id) {
        await this.onFilterChange();
        this.setDismissalData(true);
      }
    });
  }
}
