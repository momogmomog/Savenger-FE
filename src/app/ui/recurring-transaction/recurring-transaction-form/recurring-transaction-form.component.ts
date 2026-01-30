import { Component, input, OnInit, output, signal } from '@angular/core';
import { FieldError } from '../../../shared/field-error/field-error';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { RecurringTransactionPayload } from '../../../api/transaction/recurring/recurring-transaction.payload';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { CategorySelectControlComponent } from '../../category/category-select-control/category-select-control.component';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { TagMultiselectControlComponent } from '../../tag/tag-multiselect-control/tag-multiselect-control.component';
import { SelectOptions } from '../../../api/common/select-options';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { ModalService } from '../../../shared/modal/modal.service';
import { RrulePickerModal } from '../../../shared/components/rrule-picker/rrule-picker.modal';
import { RrulePickerModalPayload } from '../../../shared/components/rrule-picker/rrule-picker.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { addIcons } from 'ionicons';
import { calendarClearOutline, chevronDownOutline } from 'ionicons/icons';

@Component({
  selector: 'app-recurring-transaction-form',
  templateUrl: './recurring-transaction-form.component.html',
  styleUrls: ['./recurring-transaction-form.component.scss'],
  imports: [
    CategorySelectControlComponent,
    ErrorMessageComponent,
    FormsModule,
    InputComponent,
    IonButton,
    ReactiveFormsModule,
    SelectComponent,
    TagMultiselectControlComponent,
    IonInput,
    IonIcon,
  ],
})
export class RecurringTransactionFormComponent implements OnInit {
  form: DeepFormified<RecurringTransactionPayload>;
  transactionTypeOptions = SelectOptions.transactionTypeOptions();

  budgetId = input.required<number>();
  errors = input<FieldError[]>([]);
  recurringTransaction = input<RecurringTransaction>();

  formSubmitted = output<RecurringTransactionPayload>();

  initTags = signal<boolean>(false);
  selectedRecurrenceText = signal<string | null>(null);

  constructor(private modalService: ModalService) {
    addIcons({ calendarClearOutline, chevronDownOutline });
    this.form = new FormGroup({
      amount: FormUtil.requiredNumber(),
      autoExecute: FormUtil.requiredBool(false),
      type: FormUtil.requiredField<TransactionType>(),
      budgetId: FormUtil.requiredNumber(),
      recurringRule: FormUtil.requiredString(),
      categoryId: FormUtil.requiredNumber(),
      tagIds: new FormArray<FormControl<number>>([]),
    });
  }

  ngOnInit(): void {
    this.form.patchValue({ budgetId: this.budgetId() });

    const rTransaction = this.recurringTransaction();
    if (rTransaction) {
      const formValue = {
        ...rTransaction,
      };

      this.form.patchValue(formValue);
    }

    this.initTags.set(true);
  }

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }

  async selectRecurrence(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      RrulePickerModal,
      RrulePickerModalPayload.fromFormGroup(this.form, 'recurringRule'),
      { shellType: ShellType.HEADER, title: 'Pick Recurrence' },
    );

    resp.ifConfirmed((rRule) => {
      if (rRule) {
        this.selectedRecurrenceText.set(rRule.toText());
      }
    });
  }
}
