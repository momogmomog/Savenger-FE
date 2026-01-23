import { Component, effect, OnInit, signal } from '@angular/core';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import { CreateTransferTransactionModalPayload } from './create-transfer-transaction-modal.payload';
import { TransferTransaction } from '../../../api/transfer/transaction/transfer-transaction';
import { TransferTransactionService } from '../../../api/transfer/transaction/transfer-transaction.service';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { CreateTransferTransactionPayload } from '../../../api/transfer/transaction/create-transfer-transaction.payload';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldError } from '../../../shared/field-error/field-error';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { IonButton } from '@ionic/angular/standalone';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { ShowLoader } from '../../../shared/loader/show.loader.decorator';
import { CategorySelectControlComponent } from '../../category/category-select-control/category-select-control.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';

@Component({
  selector: 'app-create-transfer-transaction-modal',
  templateUrl: './create-transfer-transaction-modal.component.html',
  styleUrls: ['./create-transfer-transaction-modal.component.scss'],
  imports: [
    ErrorMessageComponent,
    IonButton,
    LoaderComponent,
    ReactiveFormsModule,
    CategorySelectControlComponent,
    InputComponent,
  ],
})
export class CreateTransferTransactionModalComponent
  extends ModalContentBaseComponent<
    CreateTransferTransactionModalPayload,
    TransferTransaction
  >
  implements OnInit
{
  form: Formified<CreateTransferTransactionPayload>;
  errors = signal<FieldError[]>([]);

  constructor(private transferTransactionService: TransferTransactionService) {
    super();

    this.form = new FormGroup({
      transferId: FormUtil.requiredNumber(),
      amount: FormUtil.requiredNumber(),
      receiverCategoryId: FormUtil.requiredNumber(),
      sourceCategoryId: FormUtil.requiredNumber(),
      receiverComment: FormUtil.optionalString(),
      sourceComment: FormUtil.optionalString(),
    });

    effect(() => {
      const transfer = this.payload().transfer;

      this.form.patchValue({
        transferId: transfer.id,
      });
    });
  }

  ngOnInit(): void {}

  @ShowLoader({ name: 'transferTransactionCreationLoader' })
  async onFormSubmit(): Promise<void> {
    this.errors.set([]);

    const resp =
      await this.transferTransactionService.createTransferTransaction(
        this.form.getRawValue(),
      );

    this.errors.set(resp.errors);

    if (resp.isSuccess) {
      void this.dismiss(resp.response);
    }
  }
}
