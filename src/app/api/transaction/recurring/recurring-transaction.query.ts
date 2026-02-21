import {
  PageRequest,
  PageRequestImpl,
} from '../../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../../shared/util/sort.query';
import { TransactionType } from '../transaction.type';
import { BetweenQuery } from '../../../shared/util/between-query';

export interface RecurringTransactionQuery {
  page: PageRequest;
  sort: SortQuery;

  budgetId: number;
  transactionType: TransactionType | null;
  nextDate: BetweenQuery<Date> | null;
  autoExecute: boolean | null;
  amount: BetweenQuery<number> | null;
  prepaymentId: number | null;
  categoryIds: number[];
  completed: boolean | null;
  debtId: number | null;
  tagIds: number[];
}

export class RecurringTransactionQueryImpl
  implements RecurringTransactionQuery
{
  page: PageRequest = new PageRequestImpl();
  sort: SortQuery = {
    field: 'nextDate',
    direction: SortDirection.ASC,
  };

  budgetId: number;
  transactionType: TransactionType | null = null;
  nextDate: BetweenQuery<Date> | null = null;
  autoExecute: boolean | null = null;
  amount: BetweenQuery<number> | null = null;
  prepaymentId: number | null = null;
  categoryIds: number[] = [];
  completed: boolean | null = false;
  debtId: number | null = null;
  tagIds: number[] = [];

  constructor(budgetId: number | null) {
    this.budgetId = budgetId!;
  }
}
