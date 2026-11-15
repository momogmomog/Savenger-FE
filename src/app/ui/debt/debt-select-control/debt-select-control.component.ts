import { Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { Page } from '../../../shared/util/page';
import { PaginatedSelectControlBase } from '../../../shared/form-controls/select-search/paginated-select-control.base';
import { Debt } from '../../../api/debt/debt';
import { DebtQuery, DebtQueryImpl } from '../../../api/debt/debt.query';
import { DebtService } from '../../../api/debt/debt.service';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  selector: 'app-debt-select-control',
  templateUrl: './debt-select-control.component.html',
  styleUrls: ['./debt-select-control.component.scss'],
  imports: [SelectSearchComponent, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DebtSelectControlComponent),
      multi: true,
    },
  ],
})
export class DebtSelectControlComponent extends PaginatedSelectControlBase<
  Debt,
  DebtQuery
> {
  protected readonly query: DebtQuery = new DebtQueryImpl();

  receiverBudgetId = input.required<number>();
  label = input<string>('Debt to Repay (Optional)');

  constructor(
    private debtService: DebtService,
    private modalService: ModalService,
  ) {
    super();
  }

  protected syncQueryInputs(): void {
    this.query.receiverBudgetId = this.receiverBudgetId();
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

  protected async fetchPage(): Promise<Page<Debt> | null> {
    const response = await this.debtService.search(this.query);

    if (!response.isSuccess) {
      console.error(response);
      void this.modalService.showDangerToast('Could not fetch debts!');
      return null;
    }

    return response.response;
  }

  protected mapToSelectItem(debt: Debt): SelectSearchItem<Debt> {
    const lenderName =
      debt.lenderBudget?.budgetName || `Budget #${debt.lenderBudgetId}`;
    const receiverName =
      debt.receiverBudget?.budgetName || `Budget #${debt.receiverBudgetId}`;
    return new SelectSearchItemImpl(
      `${lenderName} lends to ${receiverName} ($${debt.amount.toFixed(2)} remaining)`,
      debt.id,
      debt,
    );
  }
}
