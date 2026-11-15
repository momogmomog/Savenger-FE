import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { DebtSelectControlComponent } from '../../debt/debt-select-control/debt-select-control.component';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonText,
} from '@ionic/angular/standalone';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { TagMultiselectControlComponent } from '../../tag/tag-multiselect-control/tag-multiselect-control.component';
import { SelectOptions } from '../../../api/common/select-options';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { ModalService } from '../../../shared/modal/modal.service';
import { RrulePickerModal } from '../../../shared/components/rrule-picker/rrule-picker.modal';
import { RrulePickerModalPayload } from '../../../shared/components/rrule-picker/rrule-picker.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { addIcons } from 'ionicons';
import {
  calendarClearOutline,
  chevronDownOutline,
  repeatOutline,
  swapHorizontalOutline,
} from 'ionicons/icons';
import { CheckboxComponent } from '../../../shared/form-controls/checkbox/checkbox.component';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { RRuleUtils } from '../../../shared/util/rrule-utils';

@Component({
  selector: 'app-recurring-transaction-form',
  templateUrl: './recurring-transaction-form.component.html',
  styleUrls: ['./recurring-transaction-form.component.scss'],
  imports: [
    CategorySelectControlComponent,
    DebtSelectControlComponent,
    ErrorMessageComponent,
    FormsModule,
    InputComponent,
    IonButton,
    IonCard,
    IonCardContent,
    IonText,
    ReactiveFormsModule,
    SelectComponent,
    TagMultiselectControlComponent,
    IonInput,
    IonIcon,
    CheckboxComponent,
    DatePickerComponent,
  ],
})
export class RecurringTransactionFormComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  form: DeepFormified<RecurringTransactionPayload>;
  transactionTypeOptions = SelectOptions.transactionTypeOptions();

  budgetId = input.required<number>();
  errors = input<FieldError[]>([]);
  recurringTransaction = input<RecurringTransaction>();
  formGroup = input<DeepFormified<RecurringTransactionPayload>>();
  showDebtSelector = input<boolean>(true);
  embedded = input<boolean>(false);

  formSubmitted = output<RecurringTransactionPayload>();

  initTags = signal<boolean>(false);
  selectedRecurrenceText = signal<string | null>(null);

  static createFormGroup(): DeepFormified<RecurringTransactionPayload> {
    return new FormGroup({
      amount: FormUtil.requiredNumber(),
      autoExecute: FormUtil.requiredBool(false),
      type: FormUtil.requiredField<TransactionType>(TransactionType.EXPENSE),
      budgetId: FormUtil.requiredNumber(),
      recurringRule: FormUtil.requiredString(),
      categoryId: FormUtil.requiredNumber(),
      comment: FormUtil.optionalString(),
      includeInBalance: FormUtil.requiredBool(false),
      startFrom: FormUtil.optionalField<Date>(new Date()),
      debtId: FormUtil.optionalNumber(),
      tagIds: new FormArray<FormControl<number>>([]),
    });
  }

  constructor(private modalService: ModalService) {
    addIcons({
      calendarClearOutline,
      chevronDownOutline,
      repeatOutline,
      swapHorizontalOutline,
    });
    this.form = RecurringTransactionFormComponent.createFormGroup();
  }

  ngOnInit(): void {
    const externalForm = this.formGroup();
    if (externalForm) {
      this.form = externalForm;
    }

    this.form.patchValue({ budgetId: this.budgetId() }, { emitEvent: false });

    const rTransaction = this.recurringTransaction();
    if (rTransaction) {
      const formValue = {
        ...rTransaction,
        startFrom: rTransaction.startFrom
          ? new Date(rTransaction.startFrom)
          : new Date(),
      };

      this.form.patchValue(formValue, { emitEvent: false });
    }

    const currentRule = this.form.controls.recurringRule.value;
    if (currentRule) {
      this.selectedRecurrenceText.set(
        RRuleUtils.toHumanReadableText(currentRule),
      );
    }

    this.form.controls.recurringRule.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rule) => {
        this.selectedRecurrenceText.set(
          rule ? RRuleUtils.toHumanReadableText(rule) : null,
        );
      });

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
        this.form.controls.recurringRule.markAsDirty();
        this.selectedRecurrenceText.set(rRule.toText());
      }
    });
  }
}
