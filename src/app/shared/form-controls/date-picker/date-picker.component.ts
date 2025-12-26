import {
  Component,
  forwardRef,
  input,
  model,
  OnInit,
  output,
  ViewChild,
} from '@angular/core';
import { ErrorMessageComponent } from '../../field-error/error-message/error-message.component';
import {
  IonButton,
  IonDatetime,
  IonDatetimeButton,
  IonItem,
  IonLabel,
  IonModal,
  IonNote,
} from '@ionic/angular/standalone';
import { StringUtils } from '../../util/string-utils';
import { FieldError } from '../../field-error/field-error';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { ObjectUtils } from '../../util/object-utils';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  imports: [
    ErrorMessageComponent,
    IonDatetime,
    IonDatetimeButton,
    ReactiveFormsModule,
    IonModal,
    IonItem,
    IonLabel,
    FormsModule,
    IonNote,
    IonButton,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  formControlName = model<string>();
  label = input<string>('');
  generateUniqueControlName = input<boolean>(false);
  errors = input<FieldError[]>([]);

  disabled = model<boolean>(false);

  onTouch = output<Date | null>();
  onChange = output<Date | null>();

  currentDateString: string | null = null;

  inputId!: string;

  @ViewChild('modal') modal!: IonModal;

  constructor() {}

  writeValue(obj: any): void {
    if (obj instanceof Date) {
      this.currentDateString = obj.toISOString();
    } else if (typeof obj === 'string') {
      this.currentDateString = obj; // Fallback if string is passed
    } else if (ObjectUtils.isNil(obj)) {
      this.currentDateString = null;
    } else {
      console.log('Cannot write provided value as date, using null', obj);
      this.currentDateString = null;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange.subscribe((value: any) => fn(value));
  }

  registerOnTouched(fn: any): void {
    this.onTouch.subscribe((value: any) => fn(value));
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  ngOnInit(): void {
    const prefix = this.formControlName() || '';
    this.inputId = `${prefix}_${StringUtils.getUniqueStr()}`;

    if (this.generateUniqueControlName()) {
      this.formControlName.set(StringUtils.getUniqueStr());
    }
  }

  protected readonly input = input;

  protected onIonChange(): void {
    this.onChange.emit(this.toDate());
  }

  protected onTouchEnd(): void {
    this.onTouch.emit(this.toDate());
  }

  openModal(): void {
    void this.modal.present();
  }

  private toDate(): Date | null {
    if (!this.currentDateString) {
      return null;
    }

    return new Date(this.currentDateString);
  }

  protected onClear(): void {
    this.currentDateString = null;
    this.onIonChange();
  }
}
