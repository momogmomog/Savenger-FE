import { Budget } from '../../../api/budget/budget';

export class CreateTransferModalPayload {
  constructor(public readonly budget: Budget) {}
}
