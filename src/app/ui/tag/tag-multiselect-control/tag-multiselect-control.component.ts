import { Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import { TagService } from '../../../api/tag/tag.service';
import { DeepFormified } from '../../../shared/util/forms.util';
import { Tag } from '../../../api/tag/tag';
import { Page } from '../../../shared/util/page';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { TagQuery, TagQueryImpl } from '../../../api/tag/tag.query';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import { RecurringTransactionPayload } from '../../../api/transaction/recurring/recurring-transaction.payload';
import { PaginatedMultiselectControlBase } from '../../../shared/form-controls/select-search/paginated-multiselect-control.base';

@Component({
  selector: 'app-tag-multiselect-control',
  templateUrl: './tag-multiselect-control.component.html',
  styleUrls: ['./tag-multiselect-control.component.scss'],
  imports: [SelectSearchComponent, IonIcon, IonChip, IonLabel],
})
export class TagMultiselectControlComponent extends PaginatedMultiselectControlBase<
  Tag,
  TagQuery
> {
  protected readonly query: TagQuery = new TagQueryImpl(null!);

  form = input.required<
    | DeepFormified<CreateTransactionPayload>
    | DeepFormified<RecurringTransactionPayload>
    | FormGroup
  >();
  existingTags = input<Tag[]>();
  shouldInitTags = input<boolean>();

  selectedTagsChange = output<Tag[]>();

  constructor(private tagService: TagService) {
    super();
  }

  protected shouldInit(): boolean | undefined {
    return this.shouldInitTags();
  }

  protected existingItems(): Tag[] | undefined {
    return this.existingTags();
  }

  protected formArray(): FormArray<FormControl<number>> {
    return this.form().controls['tagIds'] as FormArray<FormControl<number>>;
  }

  protected emitSelectedItems(items: Tag[]): void {
    this.selectedTagsChange.emit(items);
  }

  protected getSearchQuery(): string | null {
    return this.query.tagName;
  }

  protected applySearchQuery(val: string | null): void {
    this.query.tagName = val;
  }

  protected fetchPage(): Promise<Page<Tag>> {
    return this.tagService.search(this.query);
  }

  protected mapToSelectItem(tag: Tag): SelectSearchItem<Tag> {
    return new SelectSearchItemImpl(tag.tagName, tag.id, tag);
  }

  protected override onSelectionRefreshed(ids: number[]): void {
    this.query.excludeIds = ids;
  }
}
