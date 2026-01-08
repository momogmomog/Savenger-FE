import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { CreateCategoryPayload } from './create-category.payload';
import { Observable } from 'rxjs';
import { Category } from './category';
import { Endpoints } from '../../shared/http/endpoints';
import { Page } from '../../shared/util/page';
import { CategoryQuery } from './category.query';

@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(payload: CreateCategoryPayload): Observable<Category> {
    return this.http.post<CreateCategoryPayload, Category>(
      Endpoints.CATEGORIES,
      payload,
    );
  }

  public search(payload: CategoryQuery): Observable<Page<Category>> {
    return this.http.post<CategoryQuery, Page<Category>>(
      Endpoints.CATEGORIES_SEARCH,
      payload,
    );
  }
}
