import { Component, effect, input, OnInit, output } from '@angular/core';
import { Formified, FormUtil } from '../../../shared/util/forms.util';
import { FieldError } from '../../../shared/field-error/field-error';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { IonButton } from '@ionic/angular/standalone';
import { CreateTagPayload } from '../../../api/tag/create-tag.payload';
import { Tag } from '../../../api/tag/tag';

@Component({
  selector: 'app-tag-form',
  templateUrl: './tag-form.component.html',
  styleUrls: ['./tag-form.component.scss'],
  imports: [
    ErrorMessageComponent,
    InputComponent,
    ReactiveFormsModule,
    IonButton,
  ],
})
export class TagFormComponent implements OnInit {
  form: Formified<CreateTagPayload>;

  errors = input.required<FieldError[]>();
  budgetId = input.required<number>();
  tag = input<Tag>();

  formSubmitted = output<CreateTagPayload>();

  constructor() {
    this.form = new FormGroup({
      budgetId: FormUtil.requiredNumber(),
      budgetCap: FormUtil.optionalNumber(),
      tagName: FormUtil.requiredString(),
    });

    effect(() => {
      const budgetId = this.budgetId();
      this.form.patchValue({ budgetId });
    });

    effect(() => {
      const tag = this.tag();
      if (tag) {
        this.form.patchValue(tag);
      }
    });
  }

  ngOnInit(): void {}

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }
}
