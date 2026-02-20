import { Injectable } from '@angular/core';
import { TagRepository } from './tag.repository';
import { CreateTagPayload } from './create-tag.payload';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { Tag } from './tag';
import { TagQuery, TagQueryImpl } from './tag.query';
import { EmptyPage, Page } from '../../shared/util/page';

@Injectable({ providedIn: 'root' })
export class TagService {
  constructor(private repository: TagRepository) {}

  public async create(
    payload: CreateTagPayload,
  ): Promise<WrappedResponse<Tag>> {
    return await new FieldErrorWrapper(() =>
      this.repository.create(payload),
    ).execute();
  }

  public async search(query: TagQuery): Promise<Page<Tag>> {
    const resp = await new FieldErrorWrapper(() =>
      this.repository.search(query),
    ).execute();

    if (!resp.isSuccess) {
      console.error(resp);
      return new EmptyPage();
    }

    return resp.response;
  }

  public async fetchAllTags(budgetId: number): Promise<Tag[]> {
    const response: Tag[] = [];

    const query = new TagQueryImpl(budgetId);

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
