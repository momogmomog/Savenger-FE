import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCol,
  IonContent,
  IonGrid,
  IonRow,
  IonText,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';
import {
  PrepaymentFilterModalPayload,
  PrepaymentFilterModalResult,
} from './prepayment-filter-modal.payload';
import { SelectOption } from '../../../shared/form-controls/select/select.option';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { Formified } from '../../../shared/util/forms.util';

export interface PrepaymentFilterFormModel {
  completed: boolean | null;
  name: string | null;
  amountMin: number | null;
  amountMax: number | null;
  remainingMin: number | null;
  remainingMax: number | null;
  paidUntilMin: Date | null;
  paidUntilMax: Date | null;
}

@Component({
  selector: 'app-prepayment-filter-modal',
  templateUrl: './prepayment-filter-modal.component.html',
  styleUrls: ['./prepayment-filter-modal.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonToolbar,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
    IonText,
    SelectComponent,
    InputComponent,
    DatePickerComponent,
  ],
})
export class PrepaymentFilterModalComponent
  extends ModalContentBaseComponent<
    PrepaymentFilterModalPayload,
    PrepaymentFilterModalResult
  >
  implements OnInit
{
  form!: Formified<PrepaymentFilterFormModel>;

  statusOptions: SelectOption[] = [
    { key: 'All Statuses', value: null },
    { key: 'Active Only', value: false },
    { key: 'Completed Only', value: true },
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    const q = this.payload().currentQuery;

    this.form = new FormGroup({
      completed: new FormControl<boolean | null>(q.completed),
      name: new FormControl<string | null>(q.name),
      amountMin: new FormControl<number | null>(q.amount?.min ?? null),
      amountMax: new FormControl<number | null>(q.amount?.max ?? null),
      remainingMin: new FormControl<number | null>(
        q.remainingAmount?.min ?? null,
      ),
      remainingMax: new FormControl<number | null>(
        q.remainingAmount?.max ?? null,
      ),
      paidUntilMin: new FormControl<Date | null>(
        q.paidUntil?.min ? new Date(q.paidUntil.min) : null,
      ),
      paidUntilMax: new FormControl<Date | null>(
        q.paidUntil?.max ? new Date(q.paidUntil.max) : null,
      ),
    });
  }

  clearFilters(): void {
    this.form.reset({
      completed: false,
      name: null,
      amountMin: null,
      amountMax: null,
      remainingMin: null,
      remainingMax: null,
      paidUntilMin: null,
      paidUntilMax: null,
    });
  }

  applyFilters(): void {
    const raw = this.form.getRawValue();

    const result: PrepaymentFilterModalResult = {
      query: {
        completed: raw.completed,
        name: raw.name?.trim() ? raw.name.trim() : null,
        amount:
          raw.amountMin != null || raw.amountMax != null
            ? {
                min: raw.amountMin ?? undefined,
                max: raw.amountMax ?? undefined,
              }
            : null,
        remainingAmount:
          raw.remainingMin != null || raw.remainingMax != null
            ? {
                min: raw.remainingMin ?? undefined,
                max: raw.remainingMax ?? undefined,
              }
            : null,
        paidUntil:
          raw.paidUntilMin != null || raw.paidUntilMax != null
            ? {
                min: raw.paidUntilMin ?? undefined,
                max: raw.paidUntilMax ?? undefined,
              }
            : null,
      },
    };

    void this.dismiss(result);
  }
}
