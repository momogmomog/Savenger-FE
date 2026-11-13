import { PrepaymentQuery } from '../../../api/prepayment/prepayment.query';

export class PrepaymentFilterModalPayload {
  constructor(public readonly currentQuery: PrepaymentQuery) {}
}

export interface PrepaymentFilterModalResult {
  query: Partial<PrepaymentQuery>;
}
