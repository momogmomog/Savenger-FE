import { OtherUser } from '../user/user';

export interface Budget {
  id: number;
  budgetName: string;
  recurringRule: string;
  dateStarted: string;
  dueDate: string;
  active: boolean;
  balance: number;
  budgetCap: number;
  autoRevise: boolean;
  ownerId: number;
}

export interface BudgetFull extends Budget {
  participants: OtherUser[];
}

export class EmptyBudget implements BudgetFull {
  public static readonly EMPTY_BUDGET_ID = -1;
  active = false;
  autoRevise = false;
  balance = 0;
  budgetCap = 0;
  budgetName = 'Empty Budget';
  dateStarted: string = new Date().toISOString();
  dueDate: string = new Date().toISOString();
  id = EmptyBudget.EMPTY_BUDGET_ID;
  ownerId = -1;
  recurringRule = '';
  participants = [];
}
