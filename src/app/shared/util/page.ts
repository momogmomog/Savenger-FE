import { PageRequest, PageRequestImpl } from './page-request';

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  pageable: PageRequest;
}

export class EmptyPage<T> implements Page<T> {
  content: T[] = [];
  totalElements = 0;
  pageable: PageRequest = new PageRequestImpl(0, 10);
  totalPages = 0;
}

export class PageImpl<T> implements Page<T> {
  constructor(
    public content: T[],
    private totalItems?: number,
    private _totalPages?: number,
    private pageInfo?: PageRequest,
  ) {}

  get totalElements(): number {
    return this.totalItems || this.content.length;
  }

  get pageable(): PageRequest {
    return this.pageInfo || new PageRequestImpl(0, this.content.length);
  }

  get totalPages(): number {
    return this._totalPages || 1;
  }
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export class EmptyPagination implements Pagination {
  page = 0;
  pageSize = 1;
  totalElements = 0;
  totalPages = 1;
}
