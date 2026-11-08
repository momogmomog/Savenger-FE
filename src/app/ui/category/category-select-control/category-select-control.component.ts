import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
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
import { Page } from '../../../shared/util/page';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { PaginatedSelectControlBase } from '../../../shared/form-controls/select-search/paginated-select-control.base';

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
export class CategorySelectControlComponent extends PaginatedSelectControlBase<
  Category,
  CategoryQuery
> {
  protected readonly query: CategoryQuery = new CategoryQueryImpl(null!);

  label = input<string>('Category');
  budgetId = input.required<number>();

  constructor(private categoryService: CategoryService) {
    super();
    addIcons({ closeCircle });
  }

  protected syncQueryInputs(): void {
    this.query.budgetId = this.budgetId();
  }

  protected applySearchQuery(query: string | null): void {
    this.query.categoryName = query;
  }

  protected fetchPage(): Promise<Page<Category>> {
    return this.categoryService.search(this.query);
  }

  protected mapToSelectItem(cat: Category): SelectSearchItem<Category> {
    return new SelectSearchItemImpl(
      `${cat.categoryName} (${cat.budgetCap || 'Unlimited'})`,
      cat.id,
      cat,
    );
  }
}
