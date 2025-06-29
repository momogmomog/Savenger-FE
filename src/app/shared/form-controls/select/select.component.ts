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
import { NgForOf, NgIf } from '@angular/common';
import { SelectOption } from './select.option';
import { StringUtils } from '../../util/string-utils';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [ErrorMessageComponent, ReactiveFormsModule, NgIf, NgForOf],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements OnInit, ControlValueAccessor {
  @Input()
  @Output()
  disabled = false;

  @Input()
  placeholder!: string;

  @Input()
  formControlName!: string;

  @Input({ required: false })
  errors: FieldError[] = [];

  @Input()
  options: SelectOption[] = [];

  value: any;

  @Output()
  onChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onTouch: EventEmitter<any> = new EventEmitter<any>();

  elementId!: string;

  ngOnInit(): void {
    const prefix = this.formControlName || '';
    this.elementId = `${prefix}_${StringUtils.getUniqueStr()}`;
  }

  inputChanged(event: any): void {
    this.value = event.target.value;
    if (this.value === 'null') {
      this.value = null;
    }
    this.onChange.emit(this.value);
  }

  inputTouched(event: any): void {
    this.onTouch.emit(event);
  }

  writeValue(obj: any): void {
    this.value = obj;
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
}
