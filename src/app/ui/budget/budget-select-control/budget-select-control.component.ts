import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { Page } from '../../../shared/util/page';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import { Budget } from '../../../api/budget/budget';
import { BudgetService } from '../../../api/budget/budget.service';
import { ModalService } from '../../../shared/modal/modal.service';
import { PaginatedSelectControlBase } from '../../../shared/form-controls/select-search/paginated-select-control.base';

@Component({
  selector: 'app-budget-select-control',
  templateUrl: './budget-select-control.component.html',
  styleUrls: ['./budget-select-control.component.scss'],
  imports: [SelectSearchComponent, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BudgetSelectControlComponent),
      multi: true,
    },
  ],
})
export class BudgetSelectControlComponent extends PaginatedSelectControlBase<
  Budget,
  BudgetQuery
> {
  protected readonly query: BudgetQuery = new BudgetQueryImpl();

  excludedBudgetIds = input<number[]>([]);
  label = input<string>('Budget');

  constructor(
    private budgetService: BudgetService,
    private modalService: ModalService,
  ) {
    super();
  }

  protected syncQueryInputs(): void {
    this.query.excludedBudgetIds = this.excludedBudgetIds();
  }

  protected applySearchQuery(query: string | null): void {
    this.query.budgetName = query;
  }

  protected async fetchPage(): Promise<Page<Budget> | null> {
    const response = await this.budgetService.search(this.query);

    if (!response.isSuccess) {
      console.error(response);
      void this.modalService.showDangerToast('Could not fetch budgets!');
      return null;
    }

    return response.response;
  }

  protected mapToSelectItem(budget: Budget): SelectSearchItem<Budget> {
    return new SelectSearchItemImpl(budget.budgetName, budget.id, budget);
  }
}
