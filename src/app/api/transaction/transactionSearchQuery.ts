import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';
import { TransactionType } from './transaction.type';
import { BetweenQuery } from '../../shared/util/between-query';
import { DEFAULT_PAGE_SIZE } from '../../shared/general.constants';

export interface TransactionQuery {
  type: TransactionType | null;
  amount: BetweenQuery<number> | null;
  dateCreated: BetweenQuery<string> | null;
  comment: string | null;
  revised: boolean | null;
  categoryIds: number[];
  userIds: number[];
  noDebtTransactions: boolean | null;
  budgetId: number;
  tagIds: number[];
}

export class TransactionQueryImpl implements TransactionQuery {
  type: TransactionType | null = null;
  amount: BetweenQuery<number> | null = null;
  dateCreated: BetweenQuery<string> | null = null;
  comment: string | null = null;
  revised: boolean | null = null;
  categoryIds: number[] = [];
  noDebtTransactions: boolean | null = null;
  tagIds: number[] = [];
  userIds: number[] = [];
  budgetId: number;

  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}

export interface TransactionSearchQuery extends TransactionQuery {
  page: PageRequest;
  sort: SortQuery;
}

export class TransactionSearchQueryImpl
  extends TransactionQueryImpl
  implements TransactionSearchQuery
{
  page: PageRequest = new PageRequestImpl(0, DEFAULT_PAGE_SIZE);
  sort: SortQuery = { field: 'amount', direction: SortDirection.DESC };
  override revised: boolean | null = false;
}
