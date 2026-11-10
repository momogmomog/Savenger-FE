import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { merge } from 'rxjs';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  calendarClearOutline,
  calendarOutline,
  chevronDownOutline,
  layersOutline,
  linkOutline,
  repeatOutline,
  sparklesOutline,
  walletOutline,
} from 'ionicons/icons';
import { CurrencyPipe } from '@angular/common';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { CreatePrepaymentPayload } from '../../../api/prepayment/create-prepayment.payload';
import { FieldError } from '../../../shared/field-error/field-error';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { ModalService } from '../../../shared/modal/modal.service';
import { RrulePickerModal } from '../../../shared/components/rrule-picker/rrule-picker.modal';
import { RrulePickerModalPayload } from '../../../shared/components/rrule-picker/rrule-picker.modal.payload';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { CheckboxComponent } from '../../../shared/form-controls/checkbox/checkbox.component';
import { CategorySelectControlComponent } from '../../category/category-select-control/category-select-control.component';
import { TagMultiselectControlComponent } from '../../tag/tag-multiselect-control/tag-multiselect-control.component';
import { RecurringTransactionSelectControlComponent } from '../../recurring-transaction/recurring-transaction-select-control/recurring-transaction-select-control.component';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { Budget } from '../../../api/budget/budget';

export enum PrepaymentScheduleMode {
  CREATE_NEW = 'CREATE_NEW',
  LINK_EXISTING = 'LINK_EXISTING',
}

@Component({
  selector: 'app-prepayment-form',
  templateUrl: './prepayment-form.component.html',
  styleUrls: ['./prepayment-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CurrencyPipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonInput,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonText,
    ErrorMessageComponent,
    InputComponent,
    DatePickerComponent,
    CheckboxComponent,
    CategorySelectControlComponent,
    TagMultiselectControlComponent,
    RecurringTransactionSelectControlComponent,
  ],
})
export class PrepaymentFormComponent implements OnInit {
  readonly PrepaymentScheduleMode = PrepaymentScheduleMode;
  private destroyRef = inject(DestroyRef);
  private budgetSliderService = inject(BudgetSliderService);

  form: DeepFormified<CreatePrepaymentPayload>;

  budgetId = input.required<number>();
  errors = input<FieldError[]>([]);
  prepayment = input<Prepayment>();
  associatedRecurringTransaction = input<RecurringTransaction | null>(null);

  formSubmitted = output<CreatePrepaymentPayload>();

  scheduleMode = signal<PrepaymentScheduleMode>(
    PrepaymentScheduleMode.CREATE_NEW,
  );
  initTags = signal<boolean>(false);
  selectedRecurrenceText = signal<string | null>(null);

  private customRecurrenceSelected = false;
  private customInstallmentAmountTyped = false;

  recurringTransactionErrors = computed(() =>
    (this.errors() || [])
      .filter((e) => e.field?.startsWith('recurringTransaction.'))
      .map((e) => ({
        ...e,
        field: e.field.replace(/^recurringTransaction\./, ''),
      })),
  );

  constructor(private modalService: ModalService) {
    addIcons({
      calendarClearOutline,
      chevronDownOutline,
      layersOutline,
      repeatOutline,
      addCircleOutline,
      linkOutline,
      calendarOutline,
      walletOutline,
      sparklesOutline,
    });

    const defaultPaidUntil = new Date();
    defaultPaidUntil.setFullYear(defaultPaidUntil.getFullYear() + 1);

    this.form = new FormGroup({
      amount: FormUtil.requiredNumber(),
      name: FormUtil.requiredString(),
      paidUntil: FormUtil.requiredField<Date>(defaultPaidUntil),
      budgetId: FormUtil.requiredNumber(),
      recurringTransactionId: new FormControl<number | null>(null, [
        Validators.required,
      ]),
      recurringTransaction: new FormGroup({
        type: FormUtil.requiredField<TransactionType>(TransactionType.EXPENSE),
        amount: FormUtil.requiredNumber(),
        recurringRule: FormUtil.requiredString(),
        autoExecute: FormUtil.requiredBool(false),
        categoryId: FormUtil.requiredNumber(),
        budgetId: FormUtil.requiredNumber(),
        includeInBalance: FormUtil.requiredBool(false),
        comment: FormUtil.optionalString(),
        startFrom: FormUtil.optionalField<Date>(new Date()),
        tagIds: new FormArray<FormControl<number>>([]),
      }),
    });

    effect(() => {
      const rTx = this.associatedRecurringTransaction();
      if (rTx) {
        this.form.controls.recurringTransactionId.setValue(rTx.id);
        this.form.controls.recurringTransaction.patchValue({
          type: TransactionType.EXPENSE,
          amount: rTx.amount,
          recurringRule: rTx.recurringRule,
          autoExecute: rTx.autoExecute,
          categoryId: rTx.categoryId,
          budgetId: rTx.budgetId,
          includeInBalance: rTx.includeInBalance,
          comment: rTx.comment,
          startFrom: rTx.startFrom ? new Date(rTx.startFrom) : new Date(),
        });
        if (rTx.recurringRule) {
          this.selectedRecurrenceText.set(
            RRuleUtils.toHumanReadableText(rTx.recurringRule),
          );
        }
        this.setScheduleMode(PrepaymentScheduleMode.LINK_EXISTING);
      }
    });
  }

  ngOnInit(): void {
    const bId = this.budgetId();
    this.form.patchValue({ budgetId: bId });
    this.form.controls.recurringTransaction.patchValue({
      budgetId: bId,
      type: TransactionType.EXPENSE,
    });

    const existingPrepayment = this.prepayment();
    if (existingPrepayment) {
      this.form.patchValue({
        name: existingPrepayment.name,
        amount: existingPrepayment.amount,
        paidUntil: new Date(existingPrepayment.paidUntil),
        budgetId: existingPrepayment.budgetId,
      });
    }

    const rTx = this.associatedRecurringTransaction();
    if (rTx) {
      this.setScheduleMode(PrepaymentScheduleMode.LINK_EXISTING);
    } else {
      this.setScheduleMode(PrepaymentScheduleMode.CREATE_NEW);
      this.syncDefaultRecurrenceFromBudget();
      this.recalculateInstallmentAmount();
    }

    this.setupNewSchedulePrepopulationListeners();

    this.initTags.set(true);
  }

  private getTargetBudget(): Budget | undefined {
    const bId = this.budgetId();
    const current = this.budgetSliderService.currentBudget();
    if (current.id === bId) {
      return current;
    }
    return this.budgetSliderService.fetchedBudgets().find((b) => b.id === bId);
  }

  private setupNewSchedulePrepopulationListeners(): void {
    const rTxGroup = this.form.controls.recurringTransaction;

    rTxGroup.controls.startFrom.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.customRecurrenceSelected) {
          this.syncDefaultRecurrenceFromBudget();
        }
        this.recalculateInstallmentAmount();
      });

    merge(
      this.form.controls.amount.valueChanges,
      this.form.controls.paidUntil.valueChanges,
      rTxGroup.controls.recurringRule.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.recalculateInstallmentAmount();
      });

    rTxGroup.controls.amount.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (rTxGroup.controls.amount.dirty) {
          this.customInstallmentAmountTyped = true;
        }
      });
  }

  private syncDefaultRecurrenceFromBudget(): void {
    if (this.scheduleMode() !== PrepaymentScheduleMode.CREATE_NEW) {
      return;
    }

    const budget = this.getTargetBudget();
    const budgetRule = budget?.recurringRule;
    const startFrom =
      this.form.controls.recurringTransaction.controls.startFrom.value ||
      new Date();

    if (!budgetRule) {
      return;
    }

    const generatedRule = RRuleUtils.buildScheduleRuleFromBudgetRule(
      budgetRule,
      new Date(startFrom),
    );
    if (generatedRule) {
      this.form.controls.recurringTransaction.controls.recurringRule.setValue(
        generatedRule,
        { emitEvent: false },
      );
      this.selectedRecurrenceText.set(
        RRuleUtils.toHumanReadableText(generatedRule),
      );
    }
  }

  private recalculateInstallmentAmount(): void {
    if (
      this.scheduleMode() !== PrepaymentScheduleMode.CREATE_NEW ||
      this.customInstallmentAmountTyped
    ) {
      return;
    }

    const totalAmount = Number(this.form.controls.amount.value);
    const paidUntil = this.form.controls.paidUntil.value;
    const rTxControls = this.form.controls.recurringTransaction.controls;
    const startFrom = rTxControls.startFrom.value || new Date();
    const rrule = rTxControls.recurringRule.value;

    const calculated = RRuleUtils.calculateInstallmentAmount(
      totalAmount,
      rrule,
      new Date(startFrom),
      new Date(paidUntil),
    );

    if (calculated !== null) {
      rTxControls.amount.setValue(calculated, { emitEvent: false });
    }
  }

  setScheduleMode(mode: PrepaymentScheduleMode): void {
    this.scheduleMode.set(mode);
    if (mode === PrepaymentScheduleMode.CREATE_NEW) {
      this.form.controls.recurringTransaction.enable({ emitEvent: false });
      this.form.controls.recurringTransactionId.disable({ emitEvent: false });
      if (
        !this.form.controls.recurringTransaction.controls.recurringRule.value
      ) {
        this.syncDefaultRecurrenceFromBudget();
      }
      this.recalculateInstallmentAmount();
    } else {
      this.form.controls.recurringTransactionId.enable({ emitEvent: false });
      this.form.controls.recurringTransaction.disable({ emitEvent: false });
    }
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  onSegmentChange(event: CustomEvent): void {
    const mode = event.detail.value as PrepaymentScheduleMode;
    if (mode) {
      this.setScheduleMode(mode);
    }
  }

  async selectRecurrence(): Promise<void> {
    const resp = await this.modalService.openAndWait(
      RrulePickerModal,
      RrulePickerModalPayload.fromFormGroup(
        this.form.controls.recurringTransaction,
        'recurringRule',
      ),
      { shellType: ShellType.HEADER, title: 'Pick Recurrence' },
    );

    resp.ifConfirmed((rRule) => {
      if (rRule) {
        this.customRecurrenceSelected = true;
        this.selectedRecurrenceText.set(rRule.toText());
        this.recalculateInstallmentAmount();
      }
    });
  }

  onFormSubmit(): void {
    const raw = this.form.getRawValue();
    const bId = this.budgetId();

    if (this.scheduleMode() === PrepaymentScheduleMode.CREATE_NEW) {
      this.formSubmitted.emit({
        amount: raw.amount,
        name: raw.name,
        paidUntil: raw.paidUntil,
        budgetId: bId,
        recurringTransactionId: null,
        recurringTransaction: {
          ...raw.recurringTransaction,
          type: TransactionType.EXPENSE,
          budgetId: bId,
        },
      });
    } else {
      this.formSubmitted.emit({
        amount: raw.amount,
        name: raw.name,
        paidUntil: raw.paidUntil,
        budgetId: bId,
        recurringTransactionId: raw.recurringTransactionId,
        recurringTransaction: null,
      });
    }
  }
}
