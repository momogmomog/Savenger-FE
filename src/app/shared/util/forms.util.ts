import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ObjectUtils } from './object-utils';

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

/**
 * More complex solution to Formified in case the payload contains more complex types such as arrays.
 *
 * Example with form payload that contains array:
 * export interface ExamplePayload {
 *   values: string[];
 *   customs: CustomVal[];
 * }
 *
 * export interface CustomVal {
 *   name: string;
 * }
 *
 * How the form construction would look like:
 *  form!: DeepFormified<ExamplePayload>;
 *
 *  this.form = new FormGroup({
 *      values: new FormArray<FormControl<string>>([]),
 *      customs: new FormArray<Formified<CustomVal>>([]),
 *  });
 *
 */
export type DeepFormified<T> = FormGroup<{
  [K in keyof T]: T[K] extends Array<infer U> // 1. Is it an Array?
    ? FormArray<
        // If it's an array of objects, wrap them in FormGroup.
        // If it's an array of primitives (strings), wrap in FormControl.
        U extends object ? DeepFormified<U> : FormControl<U>
      >
    : T[K] extends Date // 2. Is it a Date? (Dates are objects, catch them first!)
      ? FormControl<T[K]>
      : T[K] extends object // 3. Is it a nested Object?
        ? DeepFormified<T[K]> // Recursion: Go deeper
        : FormControl<T[K]>; // 4. Default: Primitives (string, number, boolean)
}>;

export class FormUtil {
  public static requiredField<T>(initialValue?: T | null): FormControl<T> {
    return new FormControl<T>(ObjectUtils.nullIfNil(initialValue)!, {
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
    return new FormControl<T | null>(ObjectUtils.nullIfNil(initialValue));
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
