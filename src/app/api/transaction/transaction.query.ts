import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { TransactionType } from './transaction.type';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface TransactionQuery {
  page: PageRequest;
  sort: SortQuery;
  type: TransactionType | null;
  amount: BetweenQuery<number> | null;
  dateCreated: BetweenQuery<string> | null;
  comment: string | null;
  revised: boolean | null;
  categoryId: number | null;
  userId: number | null;
  budgetId: number;
  tagId: number | null;
}

export class TransactionQueryImpl implements TransactionQuery {
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = { field: 'id', direction: SortDirection.DESC };
  type: TransactionType | null = null;
  amount: BetweenQuery<number> | null = null;
  dateCreated: BetweenQuery<string> | null = null;
  comment: string | null = null;
  revised: boolean | null = false;
  categoryId: number | null = null;
  tagId: number | null = null;
  userId: number | null = null;
  budgetId: number;

  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}
