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
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircleOutline, linkOutline } from 'ionicons/icons';
import { CurrencyPipe } from '@angular/common';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { CreatePrepaymentPayload } from '../../../api/prepayment/create-prepayment.payload';
import { FieldError } from '../../../shared/field-error/field-error';
import { Prepayment } from '../../../api/prepayment/prepayment';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { RRuleUtils } from '../../../shared/util/rrule-utils';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { RecurringTransactionSelectControlComponent } from '../../recurring-transaction/recurring-transaction-select-control/recurring-transaction-select-control.component';
import { RecurringTransactionFormComponent } from '../../recurring-transaction/recurring-transaction-form/recurring-transaction-form.component';
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
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonText,
    ErrorMessageComponent,
    InputComponent,
    DatePickerComponent,
    RecurringTransactionSelectControlComponent,
    RecurringTransactionFormComponent,
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

  private customInstallmentAmountTyped = false;

  recurringTransactionErrors = computed(() =>
    (this.errors() || [])
      .filter((e) => e.field?.startsWith('recurringTransaction.'))
      .map((e) => ({
        ...e,
        field: e.field.replace(/^recurringTransaction\./, ''),
      })),
  );

  constructor() {
    addIcons({
      addCircleOutline,
      linkOutline,
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
      recurringTransaction: RecurringTransactionFormComponent.createFormGroup(),
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
        if (!rTxGroup.controls.recurringRule.dirty) {
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
          budgetId: bId,
          debtId: null,
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
