import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { Page } from '../../../shared/util/page';
import { addIcons } from 'ionicons';
import { closeCircle } from 'ionicons/icons';
import { PaginatedSelectControlBase } from '../../../shared/form-controls/select-search/paginated-select-control.base';
import { RecurringTransaction } from '../../../api/transaction/recurring/recurring-transaction';
import {
  RecurringTransactionQuery,
  RecurringTransactionQueryImpl,
} from '../../../api/transaction/recurring/recurring-transaction.query';
import { RecurringTransactionService } from '../../../api/transaction/recurring/recurring-transaction.service';
import { BudgetSliderService } from '../../budget/budget-slider/budget-slider.service';
import { RRuleUtils } from '../../../shared/util/rrule-utils';

@Component({
  selector: 'app-recurring-transaction-select-control',
  templateUrl: './recurring-transaction-select-control.component.html',
  styleUrls: ['./recurring-transaction-select-control.component.scss'],
  imports: [SelectSearchComponent, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RecurringTransactionSelectControlComponent),
      multi: true,
    },
  ],
})
export class RecurringTransactionSelectControlComponent extends PaginatedSelectControlBase<
  RecurringTransaction,
  RecurringTransactionQuery
> {
  protected readonly query: RecurringTransactionQuery =
    new RecurringTransactionQueryImpl(null);

  label = input<string>('Recurring Transaction');
  budgetId = input.required<number>();

  constructor(
    private recurringTransactionService: RecurringTransactionService,
    private budgetSliderService: BudgetSliderService,
  ) {
    super();
    addIcons({ closeCircle });
  }

  protected syncQueryInputs(): void {
    this.query.budgetId = this.budgetId();
  }

  protected applySearchQuery(query: string | null): void {
    const trimmed = query?.trim();
    if (trimmed && !isNaN(Number(trimmed))) {
      const val = Number(trimmed);
      this.query.amount = { min: val, max: val };
    } else {
      this.query.amount = null;
    }
  }

  protected async fetchPage(): Promise<Page<RecurringTransaction> | null> {
    const resp = await this.recurringTransactionService.search(this.query);
    return resp.isSuccess ? resp.response : null;
  }

  protected mapToSelectItem(
    item: RecurringTransaction,
  ): SelectSearchItem<RecurringTransaction> {
    const categoryName =
      this.budgetSliderService.getCategoryName(item.categoryId) || item.type;
    const rule = RRuleUtils.toHumanReadableText(item.recurringRule);
    const commentSuffix = item.comment ? ` - ${item.comment}` : '';
    return new SelectSearchItemImpl(
      `${categoryName} ($${item.amount.toFixed(2)} • ${rule})${commentSuffix}`,
      item.id,
      item,
    );
  }
}
