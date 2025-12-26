export class ObjectUtils {
  public static merge<T>(objs: any[]): T {
    return [...objs].reduce((acc: any, obj: any) => {
      Object.keys(obj).forEach((k) => {
        // Check if the current key refers to an object
        // and both current and accumulator have this key
        if (
          typeof obj[k] === 'object' &&
          k in acc &&
          typeof acc[k] === 'object'
        ) {
          // In such case merge these two objects
          acc[k] = ObjectUtils.merge([acc[k], obj[k]]);
        } else {
          // Otherwise just copy the value of the current object to the accumulator
          acc[k] = obj[k];
        }
      });
      return acc;
    }, {});
  }

  public static isNil(obj: unknown): boolean {
    return obj === undefined || obj === null;
  }

  public static nullIfNil<T>(obj: T): Exclude<T, null | undefined> | null {
    if (ObjectUtils.isNil(obj)) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return obj;
  }

  public static parseBoolean(string?: string | null): boolean {
    return string?.toLowerCase() === 'true';
  }

  public static boolToYesNo(bool?: boolean): string {
    if (bool) {
      return 'Yes';
    }

    return 'No';
  }

  static allNil(values: any[]): boolean {
    for (let value of values) {
      if (!ObjectUtils.isNil(value)) {
        return false;
      }
    }
    return true;
  }
}
