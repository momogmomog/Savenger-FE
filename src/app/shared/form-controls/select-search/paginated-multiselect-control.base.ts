import {
  Directive,
  effect,
  input,
  model,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { AutoUnsubComponent } from '../../util/auto-unsub.component';
import { FormUtil } from '../../util/forms.util';
import { ObjectUtils } from '../../util/object-utils';
import { EmptyPage, Page, PageableQuery, PageImpl } from '../../util/page';
import { StringUtils } from '../../util/string-utils';
import { SelectSearchItem } from './select-search.item';

@Directive()
export abstract class PaginatedMultiselectControlBase<
    TItem extends { id: number },
    TQuery extends PageableQuery & { budgetId: number },
  >
  extends AutoUnsubComponent
  implements OnInit
{
  protected abstract readonly query: TQuery;

  budgetId = input.required<number>();

  items: TItem[] = [];
  excludedItems: TItem[] = [];
  protected payload = model<Page<SelectSearchItem<TItem>>>(new EmptyPage());
  protected searchTerm = model('');
  protected selectedItems = signal<TItem[]>([]);

  private fetchedOnce!: Promise<void>;

  protected constructor() {
    super();
    addIcons({ closeCircle });

    effect(() => {
      this.onSearch(this.searchTerm());
    });

    effect(() => {
      this.query.budgetId = this.budgetId();
      this.fetchedOnce = this.fetchItems();
    });

    effect(async () => {
      if (this.shouldInit()) {
        await this.fetchedOnce;
        const existing = untracked(() => this.existingItems());
        if (!ObjectUtils.isNil(existing)) {
          this.initControls(existing);
        }

        const control = untracked(() => this.formArray());
        this.sub = control.valueChanges.subscribe(() =>
          this.refreshSelection(),
        );
        this.refreshSelection();
      }
    });
  }

  ngOnInit(): void {}

  protected abstract shouldInit(): boolean | undefined;

  protected abstract existingItems(): TItem[] | undefined;

  protected abstract formArray(): FormArray<FormControl<number>>;

  protected abstract emitSelectedItems(items: TItem[]): void;

  protected abstract getSearchQuery(): string | null;

  protected abstract applySearchQuery(searchTerm: string | null): void;

  protected abstract fetchPage(): Promise<Page<TItem>>;

  protected abstract mapToSelectItem(item: TItem): SelectSearchItem<TItem>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onSelectionRefreshed(ids: number[], selected: TItem[]): void {}

  async fetchItems(): Promise<void> {
    const resp = await this.fetchPage();
    this.items = [...this.items, ...resp.content];

    this.payload.set(
      PageImpl.appendMapped(this.payload(), resp, this.query.page, (item) =>
        this.mapToSelectItem(item),
      ),
    );
  }

  protected initControls(items: TItem[]): void {
    this.formArray().clear();
    items.forEach((item) => this.addItemId(item.id, false));
    this.excludedItems = [...items];
  }

  addItemId(id: number, emitEvent = true): void {
    this.formArray().push(FormUtil.requiredNumber(id), {
      emitEvent,
    });
  }

  onSearch(val: string | null): void {
    val = StringUtils.trimToNull(val);
    if (this.getSearchQuery() === val) {
      return;
    }

    this.applySearchQuery(val);
    this.reloadItems();
  }

  protected reloadItems(): void {
    this.query.page.pageNumber = 0;
    this.payload.set(new EmptyPage());
    this.items = [];
    void this.fetchItems();
  }

  protected onLoadMore(page: number): void {
    this.query.page.pageNumber = page;
    void this.fetchItems();
  }

  protected onSelectionChange(item: SelectSearchItem<TItem> | null): void {
    if (item?.objRef) {
      this.addItemId(item.objRef.id);
      this.excludedItems.push(item.objRef);
    }
  }

  protected removeItem(id: number): void {
    const control = this.formArray();
    control.removeAt(control.getRawValue().indexOf(id));
    this.excludedItems.splice(
      this.excludedItems.findIndex((item) => item.id === id),
      1,
    );
  }

  protected refreshSelection(): void {
    const ids = this.formArray().getRawValue();
    const selected = ids
      .map(
        (id: number) =>
          this.items.find((item) => item.id === id) ||
          this.excludedItems.find((item) => item.id === id),
      )
      .filter((item): item is TItem => !ObjectUtils.isNil(item));

    this.selectedItems.set(selected);
    this.onSelectionRefreshed(ids, selected);
    this.emitSelectedItems(selected);

    this.applySearchQuery(null);
    this.reloadItems();
  }
}
