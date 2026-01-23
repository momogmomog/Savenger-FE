import { Budget } from '../../../api/budget/budget';

export class TransfersModalPayload {
  constructor(public readonly budget: Budget) {}
}
