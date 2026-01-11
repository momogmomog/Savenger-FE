import { ObjectUtils } from './object-utils';

export class ArrayUtils {
  public static splitToBatches<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];

    for (let i = 0; i < items.length; i += size) {
      result.push(items.slice(i, i + size));
    }

    return result;
  }

  /**
   * Checks if two arrays contain the exact same elements with the same frequencies,
   * ignoring order.
   *
   * Return true if both arrays are nil.
   */
  public static arraysEqual<T>(arr1?: T[] | null, arr2?: T[] | null): boolean {
    if (ObjectUtils.isNil(arr1) && ObjectUtils.isNil(arr2)) {
      return true;
    }

    if (ObjectUtils.isNil(arr1) || ObjectUtils.isNil(arr2)) {
      return false;
    }

    if (arr1.length !== arr2.length) {
      return false;
    }

    const elementCounts = new Map<T, number>();

    for (const item of arr1) {
      const count = elementCounts.get(item) || 0;
      elementCounts.set(item, count + 1);
    }

    for (const item of arr2) {
      const count = elementCounts.get(item);

      if (count === undefined || count === 0) {
        return false;
      }

      elementCounts.set(item, count - 1);
    }

    return true;
  }
}
