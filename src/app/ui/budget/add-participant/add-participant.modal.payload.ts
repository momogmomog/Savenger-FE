import { BudgetFull } from '../../../api/budget/budget';

export class AddParticipantModalPayload {
  constructor(public readonly budget: BudgetFull) {}
}
