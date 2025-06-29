export interface SortQuery {
  field: string;
  direction: SortDirection;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
