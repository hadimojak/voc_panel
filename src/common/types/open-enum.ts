/**
 * Known enum members plus any other string.
 * Keeps IDE autocomplete for documented CRM/SMART values while accepting
 * unexpected upstream values without TypeScript or DB failures.
 */
export type OpenEnum<T extends string> = T | (string & {});

export function openEnumValues<T extends string>(
  enumObject: Record<string, T>,
): T[] {
  return Object.values(enumObject);
}

export function isKnownOpenEnum<T extends string>(
  enumObject: Record<string, T>,
  value: string,
): value is T {
  return (openEnumValues(enumObject) as string[]).includes(value);
}

/** Empty / whitespace → null; otherwise keep the raw string (known or unknown). */
export function normalizeOpenEnumValue<T extends string>(
  value: unknown,
): OpenEnum<T> | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}
