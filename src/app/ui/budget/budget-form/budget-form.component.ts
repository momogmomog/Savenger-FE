import { Component, input, OnInit, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CreateBudgetPayload } from '../../../api/budget/dto/create-budget.payload';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { FieldError } from '../../../shared/field-error/field-error';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { IonButton } from '@ionic/angular/standalone';
import { CheckboxComponent } from '../../../shared/form-controls/checkbox/checkbox.component';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { SelectOptions } from '../../../api/common/select-options';

@Component({
  selector: 'app-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    ErrorMessageComponent,
    InputComponent,
    IonButton,
    CheckboxComponent,
    DatePickerComponent,
    SelectComponent,
  ],
})
export class BudgetFormComponent implements OnInit {
  form!: Formified<CreateBudgetPayload>;
  recurrenceOptions = SelectOptions.budgetRecurrenceOptions();

  errors = input.required<FieldError[]>();
  formSubmitted = output<CreateBudgetPayload>();

  ngOnInit(): void {
    this.form = new FormGroup({
      budgetName: FormUtil.requiredString(),
      active: FormUtil.requiredBool(true),
      autoRevise: FormUtil.requiredBool(false),
      recurringRule: FormUtil.requiredString(),
      budgetCap: FormUtil.optionalNumber(),
      balance: FormUtil.optionalNumber(0),
      dateStarted: FormUtil.requiredField<Date>(null),
    });
  }

  protected onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
