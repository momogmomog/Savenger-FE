export interface SelectSearchItem<T> {
  key: string;
  value: string | number | boolean;
  objRef: T;
}

export class SelectSearchItemImpl<T> implements SelectSearchItem<T> {
  constructor(
    public readonly key: string,
    public readonly value: string | number | boolean,
    public readonly objRef: T,
  ) {}
}
