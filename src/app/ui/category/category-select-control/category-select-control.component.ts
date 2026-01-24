import {
  Component,
  effect,
  forwardRef,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CategoryService } from '../../../api/category/category.service';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import {
  CategoryQuery,
  CategoryQueryImpl,
} from '../../../api/category/category.query';
import { Category } from '../../../api/category/category';
import { EmptyPage, Page, PageImpl } from '../../../shared/util/page';

@Component({
  selector: 'app-category-select-control',
  templateUrl: './category-select-control.component.html',
  styleUrls: ['./category-select-control.component.scss'],
  imports: [SelectSearchComponent, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategorySelectControlComponent),
      multi: true,
    },
  ],
})
export class CategorySelectControlComponent
  extends AutoUnsubComponent
  implements ControlValueAccessor, OnInit
{
  private categoryQuery: CategoryQuery = new CategoryQueryImpl(null!);

  label = input<string>('Category');
  budgetId = input.required<number>();
  disabled = model<boolean>(false);
  valueOverride = model<any>();
  searchTerm = model<string>('');

  selectionChange = output<SelectSearchItem<any> | null>();
  onTouch = output<void>();

  payload = model<Page<SelectSearchItem<Category>>>(new EmptyPage());

  constructor(private categoryService: CategoryService) {
    super();

    effect(() => {
      this.categoryQuery.budgetId = this.budgetId();
    });

    effect(() => {
      const searchTerm = this.searchTerm();
      void this.reloadFilters(searchTerm);
    });
  }

  ngOnInit(): void {}

  protected async onLoadMode(): Promise<void> {
    this.categoryQuery.page.pageNumber += 1;
    await this.fetchCategories();
  }

  async reloadFilters(query: string | null): Promise<void> {
    this.categoryQuery.categoryName = query;
    this.categoryQuery.page.pageNumber = 0;
    this.payload.set(new EmptyPage());
    await this.fetchCategories();
  }

  async fetchCategories(): Promise<void> {
    const resp = await this.categoryService.search(this.categoryQuery);

    this.payload.set(
      new PageImpl(
        [...this.payload().content].concat(
          resp.content.map(
            (cat) =>
              new SelectSearchItemImpl(
                `${cat.categoryName} (${cat.budgetCap || 'Unlimited'})`,
                cat.id,
                cat,
              ),
          ),
        ),
        resp.page.totalElements,
        resp.page.totalPages,
        this.categoryQuery.page,
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
