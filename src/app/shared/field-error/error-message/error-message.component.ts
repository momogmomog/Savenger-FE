import { Component, Input } from '@angular/core';
import { FieldError } from '../field-error';
import { FilterFieldErrorPipe } from '../filter-field-error.pipe';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-field-error',
  templateUrl: './error-message.component.html',
  standalone: true,
  imports: [FilterFieldErrorPipe, NgForOf],
})
export class ErrorMessageComponent {
  @Input() errors!: FieldError[];

  @Input() fieldName!: string;

  constructor() {}
}
