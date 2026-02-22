import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Component, model, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { EditRecurringTransactionModalPayload } from './edit-recurring-transaction.modal.payload';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { RecurringTransactionPayload } from '../../../api/transaction/recurring/recurring-transaction.payload';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { RecurringTransactionFormComponent } from '../recurring-transaction-form/recurring-transaction-form.component';

@Component({
  template: `
    <ion-content>
      <app-loader loaderName="editRTransactionLoader"></app-loader>
      <app-recurring-transaction-form
        [errors]="errors()"
        [recurringTransaction]="payload().transaction"
        [budgetId]="payload().transaction.budgetId"
        (formSubmitted)="onFormSubmit($event)"
      ></app-recurring-transaction-form>
    </ion-content>
  `,
  imports: [IonContent, LoaderComponent, RecurringTransactionFormComponent],
})
export class EditRecurringTransactionModal
  extends ModalContentBaseComponent<
    EditRecurringTransactionModalPayload,
    RecurringTransaction | null
  >
  implements OnInit
{
  errors = model<FieldError[]>([]);

  constructor(
    private recurringTransactionService: RecurringTransactionService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Update Recurring Transaction';
      cfg.showCloseButton = true;
    });
  }

  @ShowLoader({ name: 'editRTransactionLoader' })
  async onFormSubmit(payload: RecurringTransactionPayload): Promise<void> {
    this.errors.set([]);
    const resp = await this.recurringTransactionService.edit(
      this.payload().transaction.id,
      payload,
    );
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.close(resp.response);
    }
  }
}
