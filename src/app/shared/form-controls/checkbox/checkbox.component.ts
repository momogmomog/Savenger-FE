import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { StringUtils } from '../../util/string-utils';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @Input()
  label!: string;

  @Input()
  @Output()
  disabled = false;

  @Input()
  formControlName!: string;

  @Output()
  onChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onTouch: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onChangeEnd: EventEmitter<any> = new EventEmitter<any>();

  inputId!: string;

  @Input()
  value: any;

  ngOnInit(): void {
    const prefix = this.formControlName || '';
    this.inputId = `${prefix}_${StringUtils.getUniqueStr()}`;
  }

  inputChanged(event: any): void {
    this.value = event.target.checked;
    this.onChange.emit(this.value);
  }

  changeEnded(event: any): void {
    this.onChangeEnd.emit(event.target.value);
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
