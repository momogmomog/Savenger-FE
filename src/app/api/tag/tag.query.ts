import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface TagQuery {
  page: PageRequest;
  sort: SortQuery;
  budgetId: number;
  tagName: string | null;
  excludeIds: number[];
  budgetCap: BetweenQuery<number> | null;
}

export class TagQueryImpl implements TagQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = { field: 'id', direction: SortDirection.DESC };
  budgetId: number;
  tagName: string | null = null;
  budgetCap: BetweenQuery<number> | null = {};
  excludeIds: number[] = [];
  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}
