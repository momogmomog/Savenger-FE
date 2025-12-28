import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface BudgetQuery {
  page: PageRequest;
  sort: SortQuery;
  budgetName: string | null;
  dateStarted: BetweenQuery<string>;
  dueDate: BetweenQuery<string>;
  active: boolean | null;
  balance: BetweenQuery<number>;
  budgetCap: BetweenQuery<number>;
  autoRevise: boolean | null;
}

export class BudgetQueryImpl implements BudgetQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = { field: 'id', direction: SortDirection.DESC };
  budgetName: string | null = null;
  dateStarted: BetweenQuery<string> = {};
  dueDate: BetweenQuery<string> = {};
  active: boolean | null = true;
  balance: BetweenQuery<number> = {};
  budgetCap: BetweenQuery<number> = {};
  autoRevise: boolean | null = null;
}
