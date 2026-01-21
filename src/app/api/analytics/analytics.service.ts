import { Injectable } from '@angular/core';
import { AnalyticsRepository } from './analytics.repository';
import { TransactionQuery } from '../transaction/transactionSearchQuery';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';
import { CategoryAnalytic } from './dto/category-analytic';
import { TagAnalytic } from './dto/tag-analytic';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private repository: AnalyticsRepository) {}

  public async getCategoryAnalytics(
    query: TransactionQuery,
  ): Promise<WrappedResponse<CategoryAnalytic[]>> {
    return await new FieldErrorWrapper(() =>
      this.repository.getCategoryAnalytics(query),
    ).execute();
  }

  public async getTagAnalytics(
    query: TransactionQuery,
  ): Promise<WrappedResponse<TagAnalytic[]>> {
    return await new FieldErrorWrapper(() =>
      this.repository.getTagAnalytics(query),
    ).execute();
  }
}
