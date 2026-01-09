import { Component, input, OnInit, output } from '@angular/core';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { Tag } from '../../../api/tag/tag';
import { SelectOptions } from '../../../api/common/select-options';
import { FieldError } from '../../../shared/field-error/field-error';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { IonButton } from '@ionic/angular/standalone';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { Category } from '../../../api/category/category';
import {
  SelectOption,
  SelectOptionKvp,
} from '../../../shared/form-controls/select/select.option';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  imports: [
    DatePickerComponent,
    ErrorMessageComponent,
    FormsModule,
    InputComponent,
    IonButton,
    ReactiveFormsModule,
    SelectComponent,
  ],
})
export class TransactionFormComponent implements OnInit {
  form: DeepFormified<CreateTransactionPayload>;
  transactionTypeOptions = SelectOptions.transactionTypeOptions();
  categoryOptions: SelectOption[] = [];

  errors = input.required<FieldError[]>();
  transaction = input<TransactionDetailed>();
  budgetId = input.required<number>();
  type = input<TransactionType>();
  categories = input.required<Category[]>();

  formSubmitted = output<CreateTransactionPayload>();

  constructor() {
    this.form = new FormGroup({
      type: FormUtil.requiredField<TransactionType>(),
      amount: FormUtil.requiredNumber(),
      dateCreated: FormUtil.optionalField<Date>(new Date()),
      comment: FormUtil.optionalString(),
      categoryId: FormUtil.requiredNumber(),
      budgetId: FormUtil.requiredNumber(),
      tagIds: new FormArray<FormControl<number>>([]),
    });
  }

  ngOnInit(): void {
    this.categoryOptions = [new SelectOptionKvp('Choose one', null)].concat(
      ...this.categories().map(
        (cat) => new SelectOptionKvp(cat.categoryName, cat.id),
      ),
    );

    this.form.patchValue({ budgetId: this.budgetId() });

    if (this.type()) {
      this.form.patchValue({ type: this.type() });
    }

    const transaction = this.transaction();
    if (transaction) {
      const formValue = {
        ...transaction,
        dateCreated: new Date(transaction.dateCreated),
      };

      this.form.patchValue(formValue);
      this.initTagControls(transaction.tags);
    }
  }

  private initTagControls(tags: Tag[]): void {
    this.form.controls.tagIds.clear();
    tags.forEach((tag) => {
      this.addTagId(tag.id);
    });
  }

  addTagId(tagId: number): void {
    this.form.controls.tagIds.push(FormUtil.requiredNumber(tagId));
  }

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
