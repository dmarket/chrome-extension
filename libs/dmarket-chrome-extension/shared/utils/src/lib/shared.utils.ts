import { HttpErrorResponse } from '@angular/common/http';
import { assertInInjectionContext, HostAttributeToken, inject } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function hostAttr<R>(key: string, defaultValue: R): R {
  assertInInjectionContext(hostAttr);

  return (inject(new HostAttributeToken(key), { optional: true }) as R) ?? defaultValue;
}

export function parseError(e: unknown, defaultError = ''): string {
  if (e instanceof HttpErrorResponse) {
    return e.error?.['Message'] || e.message || defaultError;
  }
  return e instanceof Error ? e.message : typeof e === 'string' ? e : defaultError;
}

export const minLengthTrimmed =
  (length: number) =>
  (control: AbstractControl): ValidationErrors | null => {
    const trimmedValue = control.value?.trim?.();
    if (trimmedValue == null) return null;
    return trimmedValue.length < length
      ? { minlength: { requiredLength: length, currentLength: trimmedValue.length } }
      : null;
  };

export const maxLengthTrimmed =
  (length: number) =>
  (control: AbstractControl): ValidationErrors | null => {
    const trimmedValue = control.value?.trim();
    if (!trimmedValue) return null;
    return trimmedValue.length > length
      ? { maxlength: { requiredLength: length, currentLength: trimmedValue.length } }
      : null;
  };
