import {
  Component,
  effect,
  input,
  model,
  OnInit,
  signal,
  untracked,
  output,
} from '@angular/core';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import { CategoryService } from '../../../api/category/category.service';
import { FormUtil } from '../../../shared/util/forms.util';
import { Category } from '../../../api/category/category';
import { EmptyPage, Page, PageImpl } from '../../../shared/util/page';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import {
  CategoryQuery,
  CategoryQueryImpl,
} from '../../../api/category/category.query';
import { StringUtils } from '../../../shared/util/string-utils';
import { ObjectUtils } from '../../../shared/util/object-utils';
import { AutoUnsubComponent } from '../../../shared/util/auto-unsub.component';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';

@Component({
  selector: 'app-category-multiselect-control',
  templateUrl: './category-multiselect-control.component.html',
  imports: [SelectSearchComponent, IonIcon, IonChip, IonLabel],
})
export class CategoryMultiselectControlComponent
  extends AutoUnsubComponent
  implements OnInit
{
  private readonly categoryQuery: CategoryQuery = new CategoryQueryImpl(null!);

  budgetId = input.required<number>();
  form = input.required<any>();
  existingCategories = input<Category[]>();
  shouldInitCategories = input<boolean>();

  selectedCategoriesChange = output<Category[]>();

  categories: Category[] = [];
  excludedCategories: Category[] = [];
  protected categoriesPayload = model<Page<SelectSearchItem<Category>>>(
    new EmptyPage(),
  );
  protected searchTerm = model('');
  protected selectedCategories = signal<Category[]>([]);

  private fetchedOnce!: Promise<void>;

  constructor(private categoryService: CategoryService) {
    super();
    addIcons({ closeCircle });
    effect(() => this.onCategorySearch(this.searchTerm()));

    effect(() => {
      this.categoryQuery.budgetId = this.budgetId();
      this.fetchedOnce = this.fetchCategories();
    });

    effect(async () => {
      if (this.shouldInitCategories()) {
        await this.fetchedOnce;
        const existing = untracked(this.existingCategories);
        if (!ObjectUtils.isNil(existing)) {
          this.initControls(existing);
        }

        const form = untracked(this.form);
        this.sub = form.controls.categoryIds.valueChanges.subscribe(() =>
          this.refreshCategories(),
        );
        this.refreshCategories();
      }
    });
  }

  ngOnInit(): void {}

  async fetchCategories(): Promise<void> {
    const resp = await this.categoryService.search(this.categoryQuery);
    this.categories = [...this.categories, ...resp.content];

    this.categoriesPayload.set(
      PageImpl.appendMapped(
        this.categoriesPayload(),
        resp,
        this.categoryQuery.page,
        (cat) => new SelectSearchItemImpl(cat.categoryName, cat.id, cat),
      ),
    );
  }

  private initControls(categories: Category[]): void {
    this.form().controls.categoryIds.clear();
    categories.forEach((cat) => this.addCategoryId(cat.id, false));
    this.excludedCategories = [...categories];
  }

  addCategoryId(id: number, emitEvent = true): void {
    this.form().controls.categoryIds.push(FormUtil.requiredNumber(id), {
      emitEvent,
    });
  }

  onCategorySearch(val: string | null): void {
    val = StringUtils.trimToNull(val);
    if (this.categoryQuery.categoryName === val) return;
    this.categoryQuery.categoryName = val;
    this.reloadCategories();
  }

  private reloadCategories(): void {
    this.categoryQuery.page.pageNumber = 0;
    this.categoriesPayload.set(new EmptyPage());
    this.categories = [];
    void this.fetchCategories();
  }

  protected onCategoryLoadMore(page: number): void {
    this.categoryQuery.page.pageNumber = page;
    void this.fetchCategories();
  }

  protected onCategoryChange(item: SelectSearchItem<Category> | null): void {
    if (item?.objRef) {
      this.addCategoryId(item.objRef.id);
      this.excludedCategories.push(item.objRef);
    }
  }

  protected removeCategory(id: number): void {
    this.form().controls.categoryIds.removeAt(
      this.form().controls.categoryIds.getRawValue().indexOf(id),
    );
    this.excludedCategories.splice(
      this.excludedCategories.findIndex((c) => c.id === id),
      1,
    );
  }

  private refreshCategories(): void {
    const selected = this.form()
      .controls.categoryIds.getRawValue()
      .map(
        (id: number) =>
          this.categories.find((c) => c.id === id) ||
          this.excludedCategories.find((c) => c.id === id),
      )
      .filter((c: Category | undefined) => !ObjectUtils.isNil(c));

    this.selectedCategories.set(selected);
    this.selectedCategoriesChange.emit(selected);
    this.categoryQuery.categoryName = null;
    void this.reloadCategories();
  }
}
