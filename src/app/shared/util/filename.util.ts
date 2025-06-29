export class FilenameUtil {
  public static trimExtension(filename: string): string {
    return filename?.replace(/\.[a-zA-Z0-9-_]+$/, '');
  }
}
