export interface AnalyticsSummaryDto<T> {
  incomesSum: number;
  expensesSum: number;
  total: number;
  incomesCount: number;
  expensesCount: number;
  totalCount: number;
  items: T[];
}

export class EmptyAnalyticsSummaryDto<T> implements AnalyticsSummaryDto<T> {
  incomesSum = 0;
  expensesSum = 0;
  total = 0;
  incomesCount = 0;
  expensesCount = 0;
  totalCount = 0;
  items: T[] = [];
}
