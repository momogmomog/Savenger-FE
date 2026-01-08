import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface CategoryQuery {
  page: PageRequest;
  sort: SortQuery;
  budgetId: number;
  categoryName: string | null;
  budgetCap: BetweenQuery<number> | null;
}

export class CategoryQueryImpl implements CategoryQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = { field: 'id', direction: SortDirection.DESC };
  budgetId: number;
  categoryName: string | null = null;
  budgetCap: BetweenQuery<number> | null = {};
  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}
