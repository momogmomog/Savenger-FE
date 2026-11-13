import { Component, model, OnInit, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { PrepaymentService } from '../../../api/prepayment/prepayment.service';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { RecurringTransactionQueryImpl } from '../../../api/transaction/recurring/recurring-transaction.query';
import { SortDirection } from '../../../shared/util/sort.query';
import { ModalService } from '../../../shared/modal/modal.service';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { PrepaymentDetailsComponent } from '../prepayment-details/prepayment-details.component';
import { EditPrepaymentModal } from '../edit-prepayment-modal/edit-prepayment.modal';
import { EditPrepaymentModalPayload } from '../edit-prepayment-modal/edit-prepayment.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { FieldError } from '../../../shared/field-error/field-error';
import {
  RecurringTransactionDetailsModal,
  RecurringTransactionDetailsModalPayload,
} from '../../recurring-transaction/recurring-transaction-details-modal/recurring-transaction-details.modal';

export class PrepaymentDetailsModalPayload {
  constructor(
    public readonly prepaymentId: number,
    public readonly initialPrepayment?: Prepayment,
  ) {}
}

@Component({
  selector: 'app-prepayment-details-modal',
  template: `
    <app-loader loaderName="prepaymentDetailsLoader"></app-loader>

    @if (prepayment(); as prep) {
      <app-prepayment-details
        [prepayment]="prep"
        [recurringTransaction]="recurringTransaction()"
        [categoryName]="getCategoryName()"
        [errors]="errors()"
        [transactionsReloadTrigger]="transactionsReloadTrigger()"
        (navigateAway)="dismiss()"
        (editTriggered)="onEdit()"
        (payTriggered)="onPay()"
        (recurringTransactionClicked)="onOpenRecurringTransaction($event)"
        (transactionsUpdated)="onTransactionsUpdated()"
      ></app-prepayment-details>
    }
  `,
  imports: [LoaderComponent, PrepaymentDetailsComponent],
})
export class PrepaymentDetailsModal
  extends ModalContentBaseComponent<
    PrepaymentDetailsModalPayload,
    Prepayment | null
  >
  implements OnInit
{
  prepayment = model<Prepayment>();
  recurringTransaction = signal<RecurringTransaction | null>(null);
  errors = signal<FieldError[]>([]);
  transactionsReloadTrigger = signal<number>(0);

  constructor(
    private prepaymentService: PrepaymentService,
    private recurringTransactionService: RecurringTransactionService,
    private modalService: ModalService,
    private budgetSliderService: BudgetSliderService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    if (this.payload().initialPrepayment) {
      this.prepayment.set(this.payload().initialPrepayment);
    }
    await this.loadData();
  }

  @ShowLoader({ name: 'prepaymentDetailsLoader' })
  async loadData(): Promise<void> {
    const prepResp = await this.prepaymentService.get(
      this.payload().prepaymentId,
    );

    if (!prepResp.isSuccess || !prepResp.response) {
      await this.modalService.showDangerToast('Failed to load prepayment');
      await this.dismiss();
      return;
    }

    const prep = prepResp.response;
    this.prepayment.set(prep);

    await this.loadAssociatedRecurringTransaction(prep);
  }

  private async loadAssociatedRecurringTransaction(
    prep: Prepayment,
  ): Promise<void> {
    const query = new RecurringTransactionQueryImpl(prep.budgetId);
    query.prepaymentId = prep.id;
    query.completed = null;
    query.sort = { field: 'id', direction: SortDirection.DESC };
    query.page.pageSize = 1;

    const rResp = await this.recurringTransactionService.search(query);
    if (rResp.isSuccess && rResp.response.content.length > 0) {
      this.recurringTransaction.set(rResp.response.content[0]);
    } else {
      this.recurringTransaction.set(null);
    }
  }

  getCategoryName(): string | undefined {
    const rTx = this.recurringTransaction();
    if (!rTx) {
      return undefined;
    }
    return this.budgetSliderService.getCategoryName(rTx.categoryId);
  }

  async onEdit(): Promise<void> {
    const currentPrep = this.prepayment();
    if (!currentPrep) {
      return;
    }

    const resp = await this.modalService.openAndWait(
      EditPrepaymentModal,
      new EditPrepaymentModalPayload(currentPrep, this.recurringTransaction()),
      { shellType: ShellType.HEADER, title: 'Edit Prepayment' },
    );

    resp.ifConfirmed(async (updated) => {
      if (!ObjectUtils.isNil(updated?.id)) {
        this.setDismissalData(updated);
        this.prepayment.set(updated);
        await this.loadAssociatedRecurringTransaction(updated);
        this.transactionsReloadTrigger.update((v) => v + 1);
      }
    });
  }

  @ShowLoader({ name: 'prepaymentDetailsLoader' })
  async onPay(): Promise<void> {
    const rTx = this.recurringTransaction();
    const prep = this.prepayment();
    if (!rTx || !prep) {
      return;
    }

    const confirmed = await this.modalService.prompt(
      'Execute next prepayment installment payment?',
      'Pay Now',
    );
    if (!confirmed) {
      return;
    }

    this.errors.set([]);
    const payResp = await this.prepaymentService.pay(rTx.id);
    if (!payResp.isSuccess) {
      this.errors.set(payResp.errors);
      await this.modalService.showDangerToast(
        payResp.errors[0]?.message || 'Could not pay prepayment installment',
      );
      return;
    }

    this.recurringTransaction.set(payResp.response);

    const refreshedPrepResp = await this.prepaymentService.get(prep.id);
    if (refreshedPrepResp.isSuccess && refreshedPrepResp.response) {
      this.prepayment.set(refreshedPrepResp.response);
      this.setDismissalData(refreshedPrepResp.response);
    }
    this.transactionsReloadTrigger.update((v) => v + 1);
  }

  async onOpenRecurringTransaction(rTx: RecurringTransaction): Promise<void> {
    const resp = await this.modalService.openAndWait(
      RecurringTransactionDetailsModal,
      new RecurringTransactionDetailsModalPayload(rTx, this.getCategoryName()),
      { shellType: ShellType.BLANK },
    );

    if (!ObjectUtils.isNil(resp.result)) {
      await this.loadData();
      this.setDismissalData(this.prepayment()!);
      this.transactionsReloadTrigger.update((v) => v + 1);
    }
  }

  async onTransactionsUpdated(): Promise<void> {
    await this.loadData();
    if (this.prepayment()) {
      this.setDismissalData(this.prepayment()!);
    }
  }
}
