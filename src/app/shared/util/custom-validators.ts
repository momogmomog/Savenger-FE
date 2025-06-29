export class CustomValidators {
  public static csvFileValidator(control: any): any {
    const fileName = control.value;
    if (fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (extension !== 'csv') {
        return { invalidFileType: true };
      }
    } else {
      return { fileRequired: true };
    }
    return null;
  }

  public static zipFileValidator(control: any): any {
    const fileName = control.value;
    if (fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      if (extension !== 'zip') {
        return { invalidFileType: true };
      }
    } else {
      return { fileRequired: true };
    }
    return null;
  }
}
