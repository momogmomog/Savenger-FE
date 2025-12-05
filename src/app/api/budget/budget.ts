import { User } from '../user/user';

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
  participants: User[];
}
