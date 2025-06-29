import { DEFAULT_PAGE_SIZE } from '../general.constants';

export interface PageRequest {
  pageNumber: number;
  pageSize: number;
}

export class PageRequestImpl implements PageRequest {
  pageNumber = 0;
  pageSize: number = DEFAULT_PAGE_SIZE;

  constructor(page?: number, size?: number) {
    if (page) {
      this.pageNumber = page;
    }

    if (size) {
      this.pageSize = size;
    }
  }
}
