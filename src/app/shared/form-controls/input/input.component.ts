import {
  Component,
  forwardRef,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { ErrorMessageComponent } from '../../field-error/error-message/error-message.component';
import { FieldError } from '../../field-error/field-error';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { ObjectUtils } from '../../util/object-utils';
import { StringUtils } from '../../util/string-utils';
import { IonInput, IonTextarea } from '@ionic/angular/standalone';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    ErrorMessageComponent,
    ReactiveFormsModule,
    NgIf,
    IonInput,
    IonTextarea,
  ],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements OnInit, ControlValueAccessor {
  type = input<string>('text');

  disabled = model<boolean>(false);

  placeholder = input<string>();

  formControlName = model<string | number>();

  generateUniqueControlName = input<boolean>(false);

  errors = input<FieldError[]>([]);

  clearOnChangeEnd = input<boolean>(false);

  value: any;

  onChange = output<any>();

  onChangeEnd = output<any>();

  onTouch = output<any>();

  inputId!: string;

  ngOnInit(): void {
    const prefix = this.formControlName() || '';
    this.inputId = `${prefix}_${StringUtils.getUniqueStr()}`;

    if (this.generateUniqueControlName()) {
      this.formControlName.set(StringUtils.getUniqueStr());
    }
  }

  inputChanged(event: any): void {
    this.setValue(event.target.value);
    this.onChange.emit(this.value);
  }

  inputTouched(event: any): void {
    this.onTouch.emit(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  changeEnded(event: any): void {
    this.onChangeEnd.emit(this.value);
    if (this.clearOnChangeEnd()) {
      this.setValue('');
    }
  }

  writeValue(obj: any): void {
    this.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange.subscribe((val) => fn(val));
  }

  registerOnTouched(fn: any): void {
    this.onTouch.subscribe((val) => fn(val));
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  valueOrEmpty(): any {
    if (ObjectUtils.isNil(this.value)) {
      return '';
    }

    return this.value;
  }

  private setValue(val: any): void {
    if (
      this.type() === 'number' &&
      !ObjectUtils.isNil(val) &&
      (val + '').trim()
    ) {
      const num = Number(val);
      if (!isNaN(num)) {
        this.value = num;
        return;
      }
    }

    this.value = val;
  }
}
