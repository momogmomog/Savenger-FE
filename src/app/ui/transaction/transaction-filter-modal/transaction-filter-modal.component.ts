import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonRow,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import {
  TransactionFilterModalPayload,
  TransactionFilterModalResult,
} from './transaction-filter-modal.payload';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { SelectOptions } from '../../../api/common/select-options';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { TagMultiselectControlComponent } from '../../tag/tag-multiselect-control/tag-multiselect-control.component';
import { CategoryMultiselectControlComponent } from '../../category/category-multiselect-control/category-multiselect-control.component';
// import { UserMultiselectControlComponent } from '../../user/user-multiselect-control/user-multiselect-control.component';
import { Tag } from '../../../api/tag/tag';
import { Category } from '../../../api/category/category';
import { OtherUser } from '../../../api/user/user';
import { ModalContentBaseComponent } from '../../../shared/modal/modals/modal-content-base.component';

@Component({
  selector: 'app-transaction-filter-modal',
  templateUrl: './transaction-filter-modal.component.html',
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonToolbar,
    IonButtons,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    SelectComponent,
    InputComponent,
    DatePickerComponent,
    TagMultiselectControlComponent,
    CategoryMultiselectControlComponent,
    // UserMultiselectControlComponent,
  ],
})
export class TransactionFilterModalComponent
  extends ModalContentBaseComponent<
    TransactionFilterModalPayload,
    TransactionFilterModalResult
  >
  implements OnInit
{
  form!: FormGroup;
  transactionTypeOptions = [
    { key: 'All', value: null },
    ...SelectOptions.transactionTypeOptions(),
  ];

  activeTags: Tag[] = [];
  activeCategories: Category[] = [];
  activeUsers: OtherUser[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    const q = this.payload().currentQuery;

    this.form = new FormGroup({
      type: new FormControl<TransactionType | null>(q.type),
      comment: new FormControl<string | null>(q.comment),
      amountMin: new FormControl<number | null>(q.amount?.min ?? null),
      amountMax: new FormControl<number | null>(q.amount?.max ?? null),
      dateMin: new FormControl<Date | null>(
        q.dateCreated?.min ? new Date(q.dateCreated.min) : null,
      ),
      dateMax: new FormControl<Date | null>(
        q.dateCreated?.max ? new Date(q.dateCreated.max) : null,
      ),
      categoryIds: new FormArray<FormControl<number>>([]),
      tagIds: new FormArray<FormControl<number>>([]),
      userIds: new FormArray<FormControl<number>>([]),
    });
  }

  clearFilters(): void {
    this.form.reset();
    (this.form.controls['categoryIds'] as FormArray).clear();
    (this.form.controls['tagIds'] as FormArray).clear();
    (this.form.controls['userIds'] as FormArray).clear();

    this.activeTags = [];
    this.activeCategories = [];
    this.activeUsers = [];
  }

  applyFilters(): void {
    const raw = this.form.getRawValue();

    const result: TransactionFilterModalResult = {
      selectedTags: this.activeTags,
      selectedCategories: this.activeCategories,
      selectedUsers: this.activeUsers,
      query: {
        type: raw.type,
        comment: raw.comment,
        categoryIds: raw.categoryIds,
        tagIds: raw.tagIds,
        userIds: raw.userIds,
        amount:
          raw.amountMin != null || raw.amountMax != null
            ? { min: raw.amountMin, max: raw.amountMax }
            : null,
        dateCreated:
          raw.dateMin != null || raw.dateMax != null
            ? {
                min: raw.dateMin?.toISOString(),
                max: raw.dateMax?.toISOString(),
              }
            : null,
      },
    };

    this.dismiss(result);
  }
}
