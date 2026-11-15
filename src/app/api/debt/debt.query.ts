import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface DebtQuery {
  page: PageRequest;
  sort: SortQuery;
  receiverBudgetId: number | null;
  lenderBudgetId: number | null;
  budgetIds: number[] | null;
  receiverName: string | null;
  lenderName: string | null;
  amount: BetweenQuery<number> | null;
}

export class DebtQueryImpl implements DebtQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = {
    field: 'id',
    direction: SortDirection.DESC,
  };

  receiverBudgetId: number | null = null;
  lenderBudgetId: number | null = null;
  budgetIds: number[] | null = null;
  receiverName: string | null = null;
  lenderName: string | null = null;
  amount: BetweenQuery<number> | null = null;

  constructor(budgetIds: number[] | null = null) {
    this.budgetIds = budgetIds;
  }
}
