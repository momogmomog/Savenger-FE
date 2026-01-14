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
  active = false;
  autoRevise = false;
  balance = 0;
  budgetCap = 0;
  budgetName = 'Empty Budget';
  dateStarted: string = new Date().toISOString();
  dueDate: string = new Date().toISOString();
  id = -1;
  ownerId = -1;
  recurringRule = '';
  participants = [];
}
