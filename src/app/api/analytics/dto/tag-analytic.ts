import { Tag } from '../../tag/tag';
import { AnalyticDto } from './analytic.dto';

export interface TagAnalytic extends AnalyticDto {
  tag: Tag;
}
