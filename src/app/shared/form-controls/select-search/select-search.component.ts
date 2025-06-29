import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SelectSearchItem } from './select-search.item';

import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { EmptyPage, Page } from '../../util/page';
import { NgForOf, NgIf } from '@angular/common';
import { ErrorMessageComponent } from '../../field-error/error-message/error-message.component';
import { FieldError } from '../../field-error/field-error';
import { StringUtils } from '../../util/string-utils';

@Component({
  selector: 'app-select-search',
  templateUrl: './select-search.component.html',
  standalone: true,
  styleUrls: ['./select-search.component.scss'],
  imports: [NgIf, NgForOf, FormsModule, ErrorMessageComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectSearchComponent),
      multi: true,
    },
  ],
})
export class SelectSearchComponent implements OnInit, ControlValueAccessor {
  @Input()
  disabled = false;

  @Input()
  placeholder = '';

  @Input()
  formControlName!: string;

  @Input()
  generateUniqueControlName = false;

  @Input()
  errors: FieldError[] = [];

  @Input()
  payload: Page<SelectSearchItem<any>> = new EmptyPage();

  @Input()
  clearOnSelect = false;

  @Input()
  nullSelectText?: string;

  @Output()
  onChange: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onTouch: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  readonly selectionChange: EventEmitter<SelectSearchItem<any>> =
    new EventEmitter<any>();

  @Output()
  readonly search: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  readonly pageChange: EventEmitter<number> = new EventEmitter<number>();

  interval: any;

  inputId!: string;

  @Input()
  currentDisplaySelection?: string = '';

  constructor() {}

  ngOnInit(): void {
    const prefix = this.formControlName || '';
    this.inputId = `${prefix}_${StringUtils.getUniqueStr()}`;
    this.selectionChange.subscribe((val) => this.onChange.next(val?.value));

    if (this.generateUniqueControlName) {
      this.formControlName = StringUtils.getUniqueStr();
    }
  }

  optionChosen(val: SelectSearchItem<any> | null, ev: MouseEvent): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const optionsContainer = ev.target.parentElement.parentElement;
    optionsContainer.classList.add('d-none');
    this.setChosenOption(val);
    setTimeout(() => optionsContainer.classList.remove('d-none'), 1000);
  }

  private setChosenOption(val: SelectSearchItem<any> | null): void {
    this.currentDisplaySelection = val?.key || '';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore if the user has set up null option, null can be passed
    this.selectionChange.next(val);

    if (this.clearOnSelect) {
      this.currentDisplaySelection = '';
      this.searchChanged(null);
    }
  }

  pageChanged(page: number): void {
    this.pageChange.next(page);
  }

  onKeyDown(): void {
    clearTimeout(this.interval);
  }

  onKeyUp(): void {
    clearTimeout(this.interval);
  }

  inputTouched(event: any): void {
    this.onTouch.emit(event);
  }

  writeValue(obj: any): void {
    const val = this.payload.content.filter((item) => item.value === obj).at(0);

    if (val) {
      this.setChosenOption(val);
    } else {
      console.warn(`Search-select cannot display ${obj}.`);
    }
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

  searchChanged(ev: any): void {
    this.search.next(ev?.target?.value);
  }
}
