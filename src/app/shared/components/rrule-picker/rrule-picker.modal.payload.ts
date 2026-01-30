import { FormGroup } from '@angular/forms';

export class RrulePickerModalPayload {
  private constructor(
    public readonly formGroup?: FormGroup,
    public readonly formControlName?: string,
    public readonly existingRrule?: string,
  ) {}

  public static fromExistingRrule(
    existingRRule: string,
  ): RrulePickerModalPayload {
    return new RrulePickerModalPayload(undefined, undefined, existingRRule);
  }

  public static empty(): RrulePickerModalPayload {
    return new RrulePickerModalPayload(undefined, undefined, undefined);
  }

  public static fromFormGroup(
    formGroup: FormGroup,
    formControlName: string,
  ): RrulePickerModalPayload {
    return new RrulePickerModalPayload(formGroup, formControlName);
  }
}
