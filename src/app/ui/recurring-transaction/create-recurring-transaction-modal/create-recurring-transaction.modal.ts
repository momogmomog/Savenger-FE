import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Component, model, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { LoaderComponent } from '../../../shared/loader/loader.component';

import { FieldError } from '../../../shared/field-error/field-error';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { CreateRecurringTransactionModalPayload } from './create-recurring-transaction.modal.payload';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';
import { RecurringTransactionFormComponent } from '../recurring-transaction-form/recurring-transaction-form.component';
import { RecurringTransactionPayload } from '../../../api/transaction/recurring/recurring-transaction.payload';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';

@Component({
  template: `
    <ion-content>
      <app-loader loaderName="createRTransactionLoader"></app-loader>
      <app-recurring-transaction-form
        [errors]="errors()"
        [budgetId]="payload().budgetId"
        (formSubmitted)="onFormSubmit($event)"
      ></app-recurring-transaction-form>
    </ion-content>
  `,
  imports: [IonContent, LoaderComponent, RecurringTransactionFormComponent],
})
export class CreateRecurringTransactionModal
  extends ModalContentBaseComponent<
    CreateRecurringTransactionModalPayload,
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

  ngOnInit(): void {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Create Recurring Transaction';
      cfg.showCloseButton = true;
    });
  }

  @ShowLoader({ name: 'createRTransactionLoader' })
  async onFormSubmit(payload: RecurringTransactionPayload): Promise<void> {
    this.errors.set([]);
    const resp = await this.recurringTransactionService.create(payload);
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.close(resp.response);
    }
  }
}
