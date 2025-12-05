import { PageRequest } from '../../shared/util/page-request';
import { SortQuery } from '../../shared/util/sort.query';
import { TransactionType } from './transaction.type';
import { BetweenQuery } from '../../shared/util/between-query';

export interface TransactionQuery {
  page: PageRequest;
  sort: SortQuery;
  type: TransactionType | null;
  amount: BetweenQuery<number>;
  dateCreated: BetweenQuery<string>;
  comment: string | null;
  revised: boolean | null;
  categoryId: number | null;
  userId: number | null;
  budgetId: number;
  tagId: number | null;
}
