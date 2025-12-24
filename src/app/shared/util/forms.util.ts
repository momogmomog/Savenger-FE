import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * This utility converts every property of T into a FormControl of that property
 *
 * How to use:
 * This is an example class that a service needs.
 * export interface ExamplePayload {
 *   name: string;
 *   enabled: boolean;
 * }
 *
 * What you would usually need to do is to create a corresponding form type for it:
 * export interface ExamplePayloadForm {
 *   name: FormControl<string>;
 *   enabled: FormControl<boolean>;
 * }
 *
 * And then in the component when creating the corm group, you would need to create form like so:
 * formGroup!: ExamplePayloadForm
 *
 * But with this function, you could eliminate the form type and just do this:
 * formGroup!: Formified<ExamplePayload>;
 */
export type Formified<T> = FormGroup<{
  [K in keyof T]: FormControl<T[K]>;
}>;

export class FormUtil {
  public static requiredField<T>(initialValue?: T | null): FormControl<T> {
    return new FormControl<T>((initialValue || null)!, {
      nonNullable: true,
      validators: [Validators.required],
    });
  }

  public static requiredString(
    initialValue?: string | null,
  ): FormControl<string> {
    return FormUtil.requiredField(initialValue);
  }

  public static requiredNumber(
    initialValue?: number | null,
  ): FormControl<number> {
    return FormUtil.requiredField(initialValue);
  }

  public static requiredBool(
    initialValue?: boolean | null,
  ): FormControl<boolean> {
    return FormUtil.requiredField(initialValue);
  }

  public static optionalField<T>(
    initialValue?: T | null,
  ): FormControl<T | null> {
    return new FormControl<T | null>(initialValue || null);
  }

  public static optionalString(
    initialValue?: string | null,
  ): FormControl<string | null> {
    return FormUtil.optionalField(initialValue);
  }

  public static optionalNumber(
    initialValue?: number | null,
  ): FormControl<number | null> {
    return FormUtil.optionalField(initialValue);
  }

  public static optionalBoolean(
    initialValue?: boolean | null,
  ): FormControl<boolean | null> {
    return FormUtil.optionalField(initialValue);
  }
}
