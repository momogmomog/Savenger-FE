import { Injectable } from '@angular/core';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { EmptyPage, Page } from '../../shared/util/page';
import { CategoryRepository } from './category.repository';
import { Category } from './category';
import { CreateCategoryPayload } from './create-category.payload';
import { CategoryQuery, CategoryQueryImpl } from './category.query';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private repository: CategoryRepository) {}

  public async create(
    payload: CreateCategoryPayload,
  ): Promise<WrappedResponse<Category>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async search(query: CategoryQuery): Promise<Page<Category>> {
    const resp = await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();

    if (!resp.isSuccess) {
      console.error(resp);
      return new EmptyPage();
    }

    return resp.response;
  }

  public async fetchAllCategories(budgetId: number): Promise<Category[]> {
    const response: Category[] = [];

    const query = new CategoryQueryImpl(budgetId);

    while (true) {
      const pageResp = await this.search(query);
      if (pageResp.content.length) {
        response.push(...pageResp.content);
        query.page.pageNumber++;

        if (pageResp.page.totalPages >= query.page.pageNumber) {
          return response;
        }
      } else {
        return response;
      }
    }
  }
}
