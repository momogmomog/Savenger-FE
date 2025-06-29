export interface BetweenQuery<T> {
  min?: T;
  max?: T;
  notBetween?: boolean;
}
