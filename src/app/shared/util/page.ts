import { PageRequest } from './page-request';

export interface PageableQuery {
  page: PageRequest;
}

export interface Page<T> {
  content: T[];
  page: PageMetadata;
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export class PageMetadataImpl implements PageMetadata {
  constructor(
    public size: number,
    public number: number,
    public totalElements: number,
    public totalPages: number,
  ) {}
}

export class EmptyPage<T> implements Page<T> {
  content: T[] = [];
  page = new PageMetadataImpl(10, 0, 0, 0);
}

export class PageImpl<T> implements Page<T> {
  public page: PageMetadata;

  constructor(
    public content: T[],
    totalItems?: number,
    totalPages?: number,
    pageInfo?: PageRequest,
  ) {
    this.page = new PageMetadataImpl(
      pageInfo?.pageSize || content.length,
      pageInfo?.pageNumber || 0,
      totalItems || content.length,
      totalPages || 1,
    );
  }

  public static hasNextPage(
    pageData: Page<unknown>,
    pageRequest: PageRequest,
  ): boolean {
    return pageData.page.totalPages - 1 > pageRequest.pageNumber;
  }

  public static appendMapped<TSource, TTarget>(
    currentPage: Page<TTarget>,
    incomingPage: Page<TSource>,
    pageInfo: PageRequest,
    mapper: (item: TSource) => TTarget,
  ): Page<TTarget> {
    return new PageImpl(
      [...currentPage.content, ...incomingPage.content.map(mapper)],
      incomingPage.page.totalElements,
      incomingPage.page.totalPages,
      pageInfo,
    );
  }
}
