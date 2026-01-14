import {
  Component,
  effect,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
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
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { TagMultiselectControlComponent } from '../../tag/tag-multiselect-control/tag-multiselect-control.component';

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
    TagMultiselectControlComponent,
  ],
})
export class TransactionFormComponent
  extends AutoUnsubComponent
  implements OnInit
{
  form: DeepFormified<CreateTransactionPayload>;
  transactionTypeOptions = SelectOptions.transactionTypeOptions();
  categoryOptions: SelectOption[] = [];

  errors = input.required<FieldError[]>();
  transaction = input<TransactionDetailed>();
  budgetId = input.required<number>();
  type = input<TransactionType>();
  categories = input.required<Category[]>();

  initTags = signal<boolean>(false);

  formSubmitted = output<CreateTransactionPayload>();

  constructor() {
    super();
    this.form = new FormGroup({
      type: FormUtil.requiredField<TransactionType>(),
      amount: FormUtil.requiredNumber(),
      dateCreated: FormUtil.optionalField<Date>(new Date()),
      comment: FormUtil.optionalString(),
      categoryId: FormUtil.requiredNumber(),
      budgetId: FormUtil.requiredNumber(),
      tagIds: new FormArray<FormControl<number>>([]),
    });

    addIcons({ closeCircle });

    effect(() => {
      const cats = this.categories();
      this.setCategoryOptions(cats);
    });
  }

  async ngOnInit(): Promise<void> {
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
    }

    this.initTags.set(true);
  }

  private setCategoryOptions(categories: Category[]): void {
    this.categoryOptions = [new SelectOptionKvp('Choose one', null)].concat(
      ...categories.map((cat) => new SelectOptionKvp(cat.categoryName, cat.id)),
    );
  }

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
