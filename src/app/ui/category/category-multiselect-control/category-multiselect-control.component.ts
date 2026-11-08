import { Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import { CategoryService } from '../../../api/category/category.service';
import { Category } from '../../../api/category/category';
import { Page } from '../../../shared/util/page';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import {
  CategoryQuery,
  CategoryQueryImpl,
} from '../../../api/category/category.query';
import { IonChip, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { PaginatedMultiselectControlBase } from '../../../shared/form-controls/select-search/paginated-multiselect-control.base';

@Component({
  selector: 'app-category-multiselect-control',
  templateUrl: './category-multiselect-control.component.html',
  imports: [SelectSearchComponent, IonIcon, IonChip, IonLabel],
})
export class CategoryMultiselectControlComponent extends PaginatedMultiselectControlBase<
  Category,
  CategoryQuery
> {
  protected readonly query: CategoryQuery = new CategoryQueryImpl(null!);

  form = input.required<FormGroup>();
  existingCategories = input<Category[]>();
  shouldInitCategories = input<boolean>();

  selectedCategoriesChange = output<Category[]>();

  constructor(private categoryService: CategoryService) {
    super();
  }

  protected shouldInit(): boolean | undefined {
    return this.shouldInitCategories();
  }

  protected existingItems(): Category[] | undefined {
    return this.existingCategories();
  }

  protected formArray(): FormArray<FormControl<number>> {
    return this.form().controls['categoryIds'] as FormArray<
      FormControl<number>
    >;
  }

  protected emitSelectedItems(items: Category[]): void {
    this.selectedCategoriesChange.emit(items);
  }

  protected getSearchQuery(): string | null {
    return this.query.categoryName;
  }

  protected applySearchQuery(val: string | null): void {
    this.query.categoryName = val;
  }

  protected fetchPage(): Promise<Page<Category>> {
    return this.categoryService.search(this.query);
  }

  protected mapToSelectItem(cat: Category): SelectSearchItem<Category> {
    return new SelectSearchItemImpl(cat.categoryName, cat.id, cat);
  }
}
