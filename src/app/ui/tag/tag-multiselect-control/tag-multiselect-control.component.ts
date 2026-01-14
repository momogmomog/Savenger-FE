import {
  Component,
  effect,
  input,
  model,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import { TagService } from '../../../api/tag/tag.service';
import { DeepFormified, FormUtil } from '../../../shared/util/forms.util';
import { Tag } from '../../../api/tag/tag';
import { EmptyPage, Page, PageImpl } from '../../../shared/util/page';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { TagQuery, TagQueryImpl } from '../../../api/tag/tag.query';
import { StringUtils } from '../../../shared/util/string-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { CreateTransactionPayload } from '../../../api/transaction/dto/create-transaction.payload';
import { TransactionDetailed } from '../../../api/transaction/transaction';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tag-multiselect-control',
  templateUrl: './tag-multiselect-control.component.html',
  styleUrls: ['./tag-multiselect-control.component.scss'],
  imports: [SelectSearchComponent, IonIcon, IonChip, IonLabel],
})
export class TagMultiselectControlComponent
  extends AutoUnsubComponent
  implements OnInit
{
  private readonly tagQuery: TagQuery = new TagQueryImpl(null!);

  budgetId = input.required<number>();
  form = input.required<DeepFormified<CreateTransactionPayload>>();
  transaction = input<TransactionDetailed>();
  shouldInitTags = input<boolean>();

  tags: Tag[] = [];
  excludedTags: Tag[] = [];
  protected tagsPayload = model<Page<SelectSearchItem<Tag>>>(new EmptyPage());
  protected searchTerm = model('');
  protected selectedTags = signal<Tag[]>([]);

  private fetchedTagsOnce!: Promise<void>;

  constructor(private tagService: TagService) {
    super();
    effect(() => {
      const searchTerm = this.searchTerm();
      this.onTagSearch(searchTerm);
    });

    effect(() => {
      this.tagQuery.budgetId = this.budgetId();
      this.fetchedTagsOnce = this.fetchTags();
    });

    effect(async () => {
      const val = this.shouldInitTags();
      if (val) {
        await this.fetchedTagsOnce;
        const transaction = untracked(this.transaction);
        if (transaction) {
          this.initTagControls(transaction.tags);
        }

        const form = untracked(this.form);
        this.sub = form.controls.tagIds.valueChanges.subscribe(() =>
          this.refreshTags(),
        );
        this.refreshTags();
      }
    });
  }

  ngOnInit(): void {}

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
    this.form().controls.tagIds.clear();
    tags.forEach((tag) => {
      this.addTagId(tag.id, false);
    });
    this.excludedTags = [...tags];
  }

  addTagId(tagId: number, emitEvent = true): void {
    this.form().controls.tagIds.push(FormUtil.requiredNumber(tagId), {
      emitEvent: emitEvent,
    });
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
    this.form().controls.tagIds.removeAt(
      this.form().controls.tagIds.getRawValue().indexOf(id),
    );
    this.excludedTags.splice(
      this.excludedTags.findIndex((t) => t.id === id),
      1,
    );
  }

  private refreshTags(): void {
    const selectedTags = this.form()
      .controls.tagIds.getRawValue()
      .map(
        (tagId) =>
          this.tags.find((tag) => tag.id === tagId) ||
          this.excludedTags.find((tag) => tag.id === tagId),
      )
      .filter((tag) => !ObjectUtils.isNil(tag));

    this.selectedTags.set(selectedTags);
    this.tagQuery.excludeIds = this.form().controls.tagIds.getRawValue();

    this.tagQuery.tagName = null;
    void this.reloadTags();
  }
}
