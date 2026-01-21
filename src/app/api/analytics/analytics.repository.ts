import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { TransactionQuery } from '../transaction/transactionSearchQuery';
import { Observable } from 'rxjs';
import { CategoryAnalytic } from './dto/category-analytic';
import { Endpoints } from '../../shared/http/endpoints';
import { TagAnalytic } from './dto/tag-analytic';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository {
  constructor(private http: HttpClientSecuredService) {}

  public getCategoryAnalytics(
    query: TransactionQuery,
  ): Observable<CategoryAnalytic[]> {
    return this.http.post<TransactionQuery, CategoryAnalytic[]>(
      Endpoints.ANALYTICS_CATEGORIES,
      query,
    );
  }

  public getTagAnalytics(query: TransactionQuery): Observable<TagAnalytic[]> {
    return this.http.post<TransactionQuery, TagAnalytic[]>(
      Endpoints.ANALYTICS_TAGS,
      query,
    );
  }
}
