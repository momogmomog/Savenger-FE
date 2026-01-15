import { Component, effect, input, OnInit, output } from '@angular/core';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { FieldError } from '../../../shared/field-error/field-error';
import { CreateCategoryPayload } from '../../../api/category/create-category.payload';
import { Category } from '../../../api/category/category';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  imports: [
    ErrorMessageComponent,
    InputComponent,
    ReactiveFormsModule,
    IonButton,
  ],
})
export class CategoryFormComponent implements OnInit {
  form: Formified<CreateCategoryPayload>;

  errors = input.required<FieldError[]>();
  budgetId = input.required<number>();
  category = input<Category>();

  formSubmitted = output<CreateCategoryPayload>();

  constructor() {
    this.form = new FormGroup({
      budgetId: FormUtil.requiredNumber(),
      budgetCap: FormUtil.optionalNumber(),
      categoryName: FormUtil.requiredString(),
    });

    effect(() => {
      const budgetId = this.budgetId();
      this.form.patchValue({ budgetId });
    });

    effect(() => {
      const category = this.category();
      if (category) {
        this.form.patchValue(category);
      }
    });
  }

  ngOnInit(): void {}

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
