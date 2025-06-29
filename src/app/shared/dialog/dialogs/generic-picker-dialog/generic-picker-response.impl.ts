export interface GenericPickerResponse<T> {
  items: T[];
}

export class GenericPickerResponseImpl<T> implements GenericPickerResponse<T> {
  constructor(public readonly items: T[]) {}
}
