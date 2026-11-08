import { signal } from '@angular/core';
import {
  InfiniteScrollCustomEvent,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { Page, PageableQuery, PageImpl } from './page';

export class PaginatedListState<T> {
  readonly items = signal<T[]>([]);
  readonly hasNextPage = signal<boolean>(true);

  public reset(query: PageableQuery): void {
    query.page.pageNumber = 0;
    this.items.set([]);
  }

  public appendPage(pageData: Page<T>, query: PageableQuery): void {
    this.items.update((current) => [...current, ...pageData.content]);
    this.hasNextPage.set(PageImpl.hasNextPage(pageData, query.page));
  }

  public async reload(
    query: PageableQuery,
    fetchFn: () => Promise<void>,
  ): Promise<void> {
    this.reset(query);
    await fetchFn();
  }

  public async loadMore(
    event: InfiniteScrollCustomEvent,
    query: PageableQuery,
    fetchFn: () => Promise<void>,
  ): Promise<void> {
    query.page.pageNumber += 1;
    await fetchFn();
    void event.target.complete();
  }

  public async handleRefresh(
    event: RefresherCustomEvent,
    refreshFn: () => Promise<void>,
  ): Promise<void> {
    await refreshFn();
    void event.target.complete();
  }
}
