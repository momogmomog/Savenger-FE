import {
  Component,
  effect,
  input,
  model,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TransactionType } from '../../../api/transaction/transaction.type';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { Tag } from '../../../api/tag/tag';
import { SelectOptions } from '../../../api/common/select-options';
import { FieldError } from '../../../shared/field-error/field-error';
import { DatePickerComponent } from '../../../shared/form-controls/date-picker/date-picker.component';
import { ErrorMessageComponent } from '../../../shared/field-error/error-message/error-message.component';
import { InputComponent } from '../../../shared/form-controls/input/input.component';
import {
  IonButton,
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { SelectComponent } from '../../../shared/form-controls/select/select.component';
import { Category } from '../../../api/category/category';
import {
  SelectOption,
  SelectOptionKvp,
} from '../../../shared/form-controls/select/select.option';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import { EmptyPage, Page, PageImpl } from '../../../shared/util/page';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { TagService } from '../../../api/tag/tag.service';
import { TagQuery, TagQueryImpl } from '../../../api/tag/tag.query';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { StringUtils } from '../../../shared/util/string-utils';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  imports: [
    DatePickerComponent,
    ErrorMessageComponent,
    FormsModule,
    InputComponent,
    IonButton,
    ReactiveFormsModule,
    SelectComponent,
    SelectSearchComponent,
    IonChip,
    IonLabel,
    IonIcon,
  ],
})
export class TransactionFormComponent
  extends AutoUnsubComponent
  implements OnInit
{
  form: DeepFormified<CreateTransactionPayload>;
  transactionTypeOptions = SelectOptions.transactionTypeOptions();
  categoryOptions: SelectOption[] = [];

  errors = input.required<FieldError[]>();
  transaction = input<TransactionDetailed>();
  budgetId = input.required<number>();
  type = input<TransactionType>();
  categories = input.required<Category[]>();

  formSubmitted = output<CreateTransactionPayload>();

  private readonly tagQuery: TagQuery = new TagQueryImpl(null!);
  tags: Tag[] = [];
  excludedTags: Tag[] = [];
  tagsPayload = model<Page<SelectSearchItem<Tag>>>(new EmptyPage());
  searchTerm = model('');
  selectedTags = signal<Tag[]>([]);

  constructor(private tagService: TagService) {
    super();
    this.form = new FormGroup({
      type: FormUtil.requiredField<TransactionType>(),
      amount: FormUtil.requiredNumber(),
      dateCreated: FormUtil.optionalField<Date>(new Date()),
      comment: FormUtil.optionalString(),
      categoryId: FormUtil.requiredNumber(),
      budgetId: FormUtil.requiredNumber(),
      tagIds: new FormArray<FormControl<number>>([]),
    });

    addIcons({ closeCircle });

    effect(() => {
      const searchTerm = this.searchTerm();
      this.onTagSearch(searchTerm);
    });

    effect(() => {
      const cats = this.categories();
      this.setCategoryOptions(cats);
    });
  }

  async ngOnInit(): Promise<void> {
    this.tagQuery.budgetId = this.budgetId();
    await this.fetchTags();

    this.form.patchValue({ budgetId: this.budgetId() });

    if (this.type()) {
      this.form.patchValue({ type: this.type() });
    }

    const transaction = this.transaction();
    if (transaction) {
      const formValue = {
        ...transaction,
        dateCreated: new Date(transaction.dateCreated),
      };

      this.form.patchValue(formValue);
      this.initTagControls(transaction.tags);
    }

    this.sub = this.form.controls.tagIds.valueChanges.subscribe(() =>
      this.refreshTags(),
    );
    this.refreshTags();
  }

  private setCategoryOptions(categories: Category[]): void {
    this.categoryOptions = [new SelectOptionKvp('Choose one', null)].concat(
      ...categories.map((cat) => new SelectOptionKvp(cat.categoryName, cat.id)),
    );
  }

  async fetchTags(): Promise<void> {
    const resp = await this.tagService.search(this.tagQuery);
    this.tags = [...this.tags, ...resp.content];
    this.tagsPayload.set(
      new PageImpl(
        [...this.tagsPayload().content].concat(
          resp.content.map(
            (tag) => new SelectSearchItemImpl(tag.tagName, tag.id, tag),
          ),
        ),
        resp.page.totalElements,
        resp.page.totalPages,
        this.tagQuery.page,
      ),
    );
  }

  private initTagControls(tags: Tag[]): void {
    this.form.controls.tagIds.clear();
    tags.forEach((tag) => {
      this.addTagId(tag.id, false);
    });
    this.excludedTags = [...tags];
  }

  addTagId(tagId: number, emitEvent = true): void {
    this.form.controls.tagIds.push(FormUtil.requiredNumber(tagId), {
      emitEvent: emitEvent,
    });
  }

  onFormSubmit(): void {
    this.formSubmitted.emit(this.form.getRawValue());
  }

  onTagSearch(val: string | null): void {
    val = StringUtils.trimToNull(val);
    if (this.tagQuery.tagName === val) {
      return;
    }

    this.tagQuery.tagName = val;

    this.reloadTags();
  }

  private reloadTags(): void {
    this.tagQuery.page.pageNumber = 0;
    this.tagsPayload.set(new EmptyPage());
    this.tags = [];
    void this.fetchTags();
  }

  protected onTagLoadMore(page: number): void {
    this.tagQuery.page.pageNumber = page;
    void this.fetchTags();
  }

  protected onTagChange(item: SelectSearchItem<Tag> | null): void {
    if (item?.objRef) {
      this.addTagId(item.objRef!.id);
      this.excludedTags.push(item.objRef);
    }
  }

  protected removeTag(id: number): void {
    this.form.controls.tagIds.removeAt(
      this.form.controls.tagIds.getRawValue().indexOf(id),
    );
    this.excludedTags.splice(
      this.excludedTags.findIndex((t) => t.id === id),
      1,
    );
  }

  private refreshTags(): void {
    const selectedTags = this.form.controls.tagIds
      .getRawValue()
      .map(
        (tagId) =>
          this.tags.find((tag) => tag.id === tagId) ||
          this.excludedTags.find((tag) => tag.id === tagId),
      )
      .filter((tag) => !ObjectUtils.isNil(tag));

    this.selectedTags.set(selectedTags);
    this.tagQuery.excludeIds = this.form.controls.tagIds.getRawValue();

    this.tagQuery.tagName = null;
    void this.reloadTags();
  }
}
