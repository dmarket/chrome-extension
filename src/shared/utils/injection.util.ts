import { assertInInjectionContext, inject, HostAttributeToken } from '@angular/core';

// Kudos to https://netbasal.com/streamlining-attribute-injection-in-angular-the-hostattributetoken-approach-494f5c1428b8
export function hostAttr<R>(key: string, defaultValue: R): R {
  assertInInjectionContext(hostAttr);

  return (inject(new HostAttributeToken(key), { optional: true }) as R) ?? defaultValue;
}

hostAttr.required = function <R>(key: string): R {
  assertInInjectionContext(hostAttr);
  return inject(new HostAttributeToken(key)) as R;
};
