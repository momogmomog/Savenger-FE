import { TransactionQuery } from '../../../api/transaction/transactionSearchQuery';
import { Tag } from '../../../api/tag/tag';
import { Category } from '../../../api/category/category';
import { OtherUser } from '../../../api/user/user';

export class TransactionFilterModalPayload {
  constructor(
    public budgetId: number,
    public currentQuery: TransactionQuery,
    public selectedTags: Tag[] = [],
    public selectedCategories: Category[] = [],
    public selectedUsers: OtherUser[] = [],
  ) {}
}

export interface TransactionFilterModalResult {
  query: Partial<TransactionQuery>;
  selectedTags: Tag[];
  selectedCategories: Category[];
  selectedUsers: OtherUser[];
}
