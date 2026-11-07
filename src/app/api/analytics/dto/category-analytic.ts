import { Category } from '../../category/category';
import { AnalyticDto } from './analytic.dto';

export interface CategoryAnalytic extends AnalyticDto {
  category: Category;
}
