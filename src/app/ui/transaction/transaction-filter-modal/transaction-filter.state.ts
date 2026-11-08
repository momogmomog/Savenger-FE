import { signal } from '@angular/core';
import { Tag } from '../../../api/tag/tag';
import { Category } from '../../../api/category/category';
import { OtherUser } from '../../../api/user/user';
import { TransactionQuery } from '../../../api/transaction/transactionSearchQuery';
import {
  TransactionFilterModalPayload,
  TransactionFilterModalResult,
} from './transaction-filter-modal.payload';

export class TransactionFilterState {
  readonly isFiltering = signal<boolean>(false);
  readonly activeTags = signal<Tag[]>([]);
  readonly activeCategories = signal<Category[]>([]);
  readonly activeUsers = signal<OtherUser[]>([]);

  public static hasActiveFilters(query: TransactionQuery): boolean {
    return (
      !!query.type ||
      !!query.amount ||
      !!query.dateCreated ||
      !!query.comment ||
      query.categoryIds.length > 0 ||
      query.tagIds.length > 0 ||
      query.userIds.length > 0
    );
  }

  public syncWithQuery(query: TransactionQuery): void {
    this.isFiltering.set(TransactionFilterState.hasActiveFilters(query));
  }

  public applyFilterResult(
    query: TransactionQuery,
    result: TransactionFilterModalResult,
  ): void {
    this.activeTags.set(result.selectedTags);
    this.activeCategories.set(result.selectedCategories);
    this.activeUsers.set(result.selectedUsers);

    Object.assign(query, result.query);
    this.syncWithQuery(query);
  }

  public clear(): void {
    this.activeUsers.set([]);
    this.activeCategories.set([]);
    this.activeTags.set([]);
    this.isFiltering.set(false);
  }

  public toModalPayload(
    budgetId: number,
    query: TransactionQuery,
  ): TransactionFilterModalPayload {
    return new TransactionFilterModalPayload(
      budgetId,
      query,
      this.activeTags(),
      this.activeCategories(),
      this.activeUsers(),
    );
  }
}
