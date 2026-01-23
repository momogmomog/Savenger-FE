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
import { SelectSearchComponent } from '../../../shared/form-controls/select-search/select-search.component';
import {
  SelectSearchItem,
  SelectSearchItemImpl,
} from '../../../shared/form-controls/select-search/select-search.item';
import { EmptyPage, Page, PageImpl } from '../../../shared/util/page';
import { BudgetQuery, BudgetQueryImpl } from '../../../api/budget/budget.query';
import { Budget } from '../../../api/budget/budget';
import { BudgetService } from '../../../api/budget/budget.service';
import { ModalService } from '../../../shared/modal/modal.service';

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
export class BudgetSelectControlComponent
  extends AutoUnsubComponent
  implements ControlValueAccessor, OnInit
{
  private budgetQuery: BudgetQuery = new BudgetQueryImpl();

  excludedBudgetIds = input<number[]>([]);
  label = input<string>('Budget');
  disabled = model<boolean>(false);
  valueOverride = model<any>();
  searchTerm = model<string>('');

  selectionChange = output<SelectSearchItem<any> | null>();
  onTouch = output<void>();

  payload = model<Page<SelectSearchItem<Budget>>>(new EmptyPage());

  constructor(
    private budgetService: BudgetService,
    private modalService: ModalService,
  ) {
    super();

    effect(() => {
      this.budgetQuery.excludedBudgetIds = this.excludedBudgetIds();
    });

    effect(() => {
      const searchTerm = this.searchTerm();
      void this.reloadFilters(searchTerm);
    });
  }

  ngOnInit(): void {}

  protected async onLoadMode(): Promise<void> {
    this.budgetQuery.page.pageNumber += 1;
    await this.fetchData();
  }

  async reloadFilters(query: string | null): Promise<void> {
    this.budgetQuery.budgetName = query;
    this.budgetQuery.page.pageNumber = 0;
    this.payload.set(new EmptyPage());
    await this.fetchData();
  }

  async fetchData(): Promise<void> {
    const response = await this.budgetService.search(this.budgetQuery);

    if (!response.isSuccess) {
      console.error(response);
      void this.modalService.showDangerToast('Could not fetch budgets!');
      return;
    }

    const resp = response.response;
    this.payload.set(
      new PageImpl(
        [...this.payload().content].concat(
          resp.content.map(
            (budget) =>
              new SelectSearchItemImpl(budget.budgetName, budget.id, budget),
          ),
        ),
        resp.page.totalElements,
        resp.page.totalPages,
        this.budgetQuery.page,
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
