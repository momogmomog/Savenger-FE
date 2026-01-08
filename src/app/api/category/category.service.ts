import { Injectable } from '@angular/core';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { EmptyPage, Page } from '../../shared/util/page';
import { CategoryRepository } from './category.repository';
import { Category } from './category';
import { CreateCategoryPayload } from './create-category.payload';
import { CategoryQuery } from './category.query';

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
}
