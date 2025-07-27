export class FileUtils {
  public static downloadCsv(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv' });

    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

  public static readFileAsString(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Error reading file.'));
        }
      };

      reader.onerror = (): void => {
        reject(new Error('Error reading file.'));
      };

      reader.readAsText(file!);
    });
  }
}
