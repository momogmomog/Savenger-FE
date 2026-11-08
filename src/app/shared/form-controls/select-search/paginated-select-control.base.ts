import { Directive, effect, model, OnInit, output } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { AutoUnsubComponent } from '../../util/auto-unsub.component';
import { EmptyPage, Page, PageableQuery, PageImpl } from '../../util/page';
import { SelectSearchItem } from './select-search.item';

@Directive()
export abstract class PaginatedSelectControlBase<
    TItem,
    TQuery extends PageableQuery,
  >
  extends AutoUnsubComponent
  implements ControlValueAccessor, OnInit
{
  protected abstract readonly query: TQuery;

  disabled = model<boolean>(false);
  valueOverride = model<any>();
  searchTerm = model<string>('');

  selectionChange = output<SelectSearchItem<TItem> | null>();
  onTouch = output<void>();

  payload = model<Page<SelectSearchItem<TItem>>>(new EmptyPage());

  protected constructor() {
    super();

    effect(() => {
      this.syncQueryInputs();
    });

    effect(() => {
      const searchTerm = this.searchTerm();
      void this.reloadFilters(searchTerm);
    });
  }

  ngOnInit(): void {}

  protected abstract syncQueryInputs(): void;

  protected abstract applySearchQuery(query: string | null): void;

  protected abstract fetchPage(): Promise<Page<TItem> | null>;

  protected abstract mapToSelectItem(item: TItem): SelectSearchItem<TItem>;

  protected async onLoadMode(): Promise<void> {
    this.query.page.pageNumber += 1;
    await this.fetchData();
  }

  async reloadFilters(query: string | null): Promise<void> {
    this.applySearchQuery(query);
    this.query.page.pageNumber = 0;
    this.payload.set(new EmptyPage());
    await this.fetchData();
  }

  async fetchData(): Promise<void> {
    const resp = await this.fetchPage();
    if (!resp) {
      return;
    }

    this.payload.set(
      PageImpl.appendMapped(this.payload(), resp, this.query.page, (item) =>
        this.mapToSelectItem(item),
      ),
    );
  }

  writeValue(value: any): void {
    if (value === undefined) {
      value = null;
    }

    this.valueOverride.set(value);
  }

  registerOnChange(fn: any): void {
    this.sub = this.selectionChange.subscribe((val) => {
      fn(val?.value);
    });
  }

  registerOnTouched(fn: any): void {
    this.sub = this.onTouch.subscribe(() => fn());
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
