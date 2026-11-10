import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface PrepaymentQuery {
  page: PageRequest;
  sort: SortQuery;
  budgetId: number;
  amount: BetweenQuery<number> | null;
  name: string | null;
  paidUntil: BetweenQuery<Date | string> | null;
  completed: boolean | null;
  remainingAmount: BetweenQuery<number> | null;
}

export class PrepaymentQueryImpl implements PrepaymentQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = {
    field: 'id',
    direction: SortDirection.DESC,
  };

  budgetId: number;
  amount: BetweenQuery<number> | null = null;
  name: string | null = null;
  paidUntil: BetweenQuery<Date | string> | null = null;
  completed: boolean | null = false;
  remainingAmount: BetweenQuery<number> | null = null;

  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}
