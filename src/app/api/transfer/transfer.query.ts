import { PageRequest, PageRequestImpl } from '../../shared/util/page-request';
import { SortDirection, SortQuery } from '../../shared/util/sort.query';

export interface TransferQuery {
  page: PageRequest;
  sort: SortQuery;
  sourceBudgetId: number;
  receiverBudgetIds: number[];
  active: boolean | null;
}

export class TransferQueryImpl implements TransferQuery {
  page = new PageRequestImpl();
  sort: SortQuery = { field: 'id', direction: SortDirection.DESC };
  sourceBudgetId: number;
  receiverBudgetIds: number[] = [];
  active: boolean | null = true;

  constructor(sourceBudgetId: number | null) {
    this.sourceBudgetId = sourceBudgetId!;
  }
}
