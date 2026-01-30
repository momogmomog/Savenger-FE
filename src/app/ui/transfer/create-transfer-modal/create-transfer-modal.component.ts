import { Component, effect, OnInit, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { CreateTransferPayload } from '../../../api/transfer/dto/create-transfer.payload';
import { TransferFull } from '../../../api/transfer/transfer';
import { TransferService } from '../../../api/transfer/transaction.service';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateTransferModalPayload } from './create-transfer-modal.payload';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { IonButton, IonLabel } from '@ionic/angular/standalone';
import { BudgetSelectControlComponent } from '../../budget/budget-select-control/budget-select-control.component';

@Component({
  selector: 'app-create-transfer-modal',
  templateUrl: './create-transfer-modal.component.html',
  styleUrls: ['./create-transfer-modal.component.scss'],
  imports: [
    LoaderComponent,
    ErrorMessageComponent,
    IonButton,
    ReactiveFormsModule,
    IonLabel,
    BudgetSelectControlComponent,
  ],
})
export class CreateTransferModalComponent
  extends ModalContentBaseComponent<CreateTransferModalPayload, TransferFull>
  implements OnInit
{
  form: Formified<CreateTransferPayload>;
  errors = signal<FieldError[]>([]);
  constructor(private transferService: TransferService) {
    super();

    this.form = new FormGroup({
      receiverBudgetId: FormUtil.requiredNumber(),
      sourceBudgetId: FormUtil.requiredNumber(),
    });

    effect(() => {
      const budgetId = this.payload().budget.id;
      this.form.patchValue({ sourceBudgetId: budgetId });
    });
  }

  ngOnInit(): void {}

  @ShowLoader({ name: 'transferCreateLoader' })
  async onFormSubmit(): Promise<void> {
    const payload = this.form.getRawValue();
    this.errors.set([]);

    const resp = await this.transferService.createTransfer(payload);
    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.close(resp.response);
    }
  }
}
