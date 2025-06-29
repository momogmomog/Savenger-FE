import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pagination } from '../../util/page';
import { NgClass, NgForOf } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgForOf, NgClass],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  @Input()
  pagination!: Pagination;

  @Input()
  maxPages = 15;

  @Output()
  pageChange: EventEmitter<number> = new EventEmitter<number>();

  hasPageOverflow(): boolean {
    return this.pagination?.totalPages > this.maxPages;
  }

  getPageNumbers(): number[] {
    const res: number[] = [];

    if (!this.hasPageOverflow()) {
      for (let i = 0; i < Math.min(this.pagination?.totalPages); i++) {
        res.push(i);
      }
    } else {
      const range = Math.floor(this.maxPages / 2);
      const start = Math.max(0, this.pagination?.page - range);
      const end = Math.min(
        this.pagination?.totalPages,
        this.pagination?.page + range,
      );

      for (let i = start; i < end; i++) {
        res.push(i);
      }
    }

    return res;
  }

  isFirstPage(): boolean {
    return this.pagination?.page < 1;
  }

  isLastPage(): boolean {
    return this.pagination?.page + 1 >= this.pagination?.totalPages;
  }

  changePage(page: number): void {
    if (
      page < 0 ||
      page >= this.pagination.totalPages ||
      page === this.pagination.page
    ) {
      return;
    }
    this.pageChange.next(page);
  }

  getNextPage(): number {
    return this.pagination.page + 1;
  }

  getPrevPage(): number {
    return this.pagination.page - 1;
  }
}
