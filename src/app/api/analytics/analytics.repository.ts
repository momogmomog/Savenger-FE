import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { TransactionQuery } from '../transaction/transactionSearchQuery';
import { Observable } from 'rxjs';
import { CategoryAnalytic } from './dto/category-analytic';
import { Endpoints } from '../../shared/http/endpoints';
import { TagAnalytic } from './dto/tag-analytic';
import { AnalyticsSummaryDto } from './dto/analytics-summary.dto';

@Injectable({ providedIn: 'root' })
export class AnalyticsRepository {
  constructor(private http: HttpClientSecuredService) {}

  public getCategoryAnalytics(
    query: TransactionQuery,
  ): Observable<AnalyticsSummaryDto<CategoryAnalytic>> {
    return this.http.post<
      TransactionQuery,
      AnalyticsSummaryDto<CategoryAnalytic>
    >(Endpoints.ANALYTICS_CATEGORIES, query);
  }

  public getTagAnalytics(
    query: TransactionQuery,
  ): Observable<AnalyticsSummaryDto<TagAnalytic>> {
    return this.http.post<TransactionQuery, AnalyticsSummaryDto<TagAnalytic>>(
      Endpoints.ANALYTICS_TAGS,
      query,
    );
  }
}
