import { BudgetStatistics } from '../../../api/budget/budget.statistics';

export class CreateRevisionModalPayload {
  constructor(public readonly statistic: BudgetStatistics) {}
}
