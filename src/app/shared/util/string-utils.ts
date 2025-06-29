export class StringUtils {
  public static generateRandomClassName(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const lettersAndDigits =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    // Choose a random character from `letters` for the first character
    const firstChar = letters.charAt(
      Math.floor(Math.random() * letters.length),
    );

    // Choose a random length for the class name between 5 and 15 characters
    const nameLength = Math.floor(Math.random() * 11) + 5;

    let className = firstChar;

    for (let i = 1; i < nameLength; i++) {
      // Choose a random character from `lettersAndDigits` for the subsequent characters
      const nextChar = lettersAndDigits.charAt(
        Math.floor(Math.random() * lettersAndDigits.length),
      );
      className += nextChar;
    }

    return className;
  }

  public static getUniqueStr(): string {
    return (Math.random().toString(36) + '0000000000').substring(2, 12);
  }

  public static trimToNull(endpoint: string | null): string | null {
    const trimmed = endpoint?.trim();
    if (!trimmed) {
      return null;
    }

    return trimmed;
  }
}
