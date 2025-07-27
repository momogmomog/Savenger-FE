import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
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

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ErrorMessageComponent, ReactiveFormsModule, NgIf],
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
  @Input({ required: false })
  type = 'text';

  @Input()
  @Output()
  disabled = false;

  @Input()
  placeholder!: string;

  @Input()
  formControlName!: string | number;

  @Input()
  generateUniqueControlName = false;

  @Input({ required: false })
  errors: FieldError[] = [];

  @Input({ required: false })
  clearOnChangeEnd = false;

  value: any;

  @Output()
  onChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onChangeEnd: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onTouch: EventEmitter<any> = new EventEmitter<any>();

  inputId!: string;

  ngOnInit(): void {
    const prefix = this.formControlName || '';
    this.inputId = `${prefix}_${StringUtils.getUniqueStr()}`;

    if (this.generateUniqueControlName) {
      this.formControlName = StringUtils.getUniqueStr();
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
    if (this.clearOnChangeEnd) {
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
    this.disabled = isDisabled;
  }

  private setValue(val: any): void {
    if (
      this.type === 'number' &&
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
