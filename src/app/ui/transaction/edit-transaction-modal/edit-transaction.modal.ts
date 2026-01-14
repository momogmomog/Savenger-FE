import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { Component, model, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { TransactionFormComponent } from '../transaction-form/transaction-form.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { Transaction } from '../../../api/transaction/transaction';
import { TransactionService } from '../../../api/transaction/transaction.service';
import { EditTransactionModalPayload } from './edit-transaction.modal.payload';
import { ShellConfigHeader } from '../../../shared/modal/shells/modal-shell.types';

@Component({
  template: `
    <ion-content>
      <app-loader loaderName="createTransactionLoader"></app-loader>
      <app-transaction-form
        [errors]="errors()"
        [transaction]="payload().transaction"
        [budgetId]="payload().transaction.budgetId"
        (formSubmitted)="onFormSubmit($event)"
      ></app-transaction-form>
    </ion-content>
  `,
  imports: [IonContent, LoaderComponent, TransactionFormComponent],
})
export class EditTransactionModal
  extends ModalContentBaseComponent<
    EditTransactionModalPayload,
    Transaction | null
  >
  implements OnInit
{
  errors = model<FieldError[]>([]);

  constructor(private transactionService: TransactionService) {
    super();
  }

  async ngOnInit(): Promise<void> {
    queueMicrotask(() => {
      const cfg = this.shellConfig() as ShellConfigHeader;
      cfg.title = 'Update Transaction';
      cfg.showCloseButton = true;
    });
  }

  @ShowLoader({ name: 'createTransactionModal' })
  async onFormSubmit(payload: CreateTransactionPayload): Promise<void> {
    this.errors.set([]);
    const resp = await this.transactionService.edit(
      payload,
      this.payload().transaction.id,
    );
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.close(resp.response);
    }
  }
}
