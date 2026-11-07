import { Component, effect, model, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import {
  TransactionFormComponent,
  TransactionFormPrepopulate,
} from '../../transaction/transaction-form/transaction-form.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { LoaderComponent } from '../../../shared/loader/loader.component';

export class RecurringTransactionExecutionModalPayload {
  constructor(public readonly recurringTransaction: RecurringTransaction) {}
}

@Component({
  template: `
    <app-loader loaderName="recurTransactionExec"></app-loader>
    @if (transaction()) {
      <app-transaction-form
        [hideDateCreated]="true"
        [errors]="errors()"
        [transaction]="transaction()"
        [budgetId]="transaction()!.budgetId"
        (formSubmitted)="formSubmitted($event)"
      ></app-transaction-form>
    }
  `,
  imports: [TransactionFormComponent, LoaderComponent],
})
export class RecurringTransactionExecutionModal extends ModalContentBaseComponent<
  RecurringTransactionExecutionModalPayload,
  RecurringTransaction
> {
  transaction = model<TransactionFormPrepopulate>();

  errors = signal<FieldError[]>([]);

  constructor(
    private recurringTransactionService: RecurringTransactionService,
  ) {
    super();

    effect(() => {
      const payload = this.payload();

      this.transaction.set({
        ...payload.recurringTransaction,
        dateCreated: null!,
      });
    });
  }

  @ShowLoader({ name: 'recurTransactionExec' })
  async formSubmitted(payload: CreateTransactionPayload): Promise<void> {
    this.errors.set([]);

    const resp = await this.recurringTransactionService.execute(
      this.payload().recurringTransaction.id,
      payload,
    );

    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      await this.close(resp.response);
    }
  }
}
