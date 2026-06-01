import type { QueryKey, QueryMatchInput } from '../types';

export const DEFAULT_STALE_TIME = 0;
export const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

const stableSerializeValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerializeValue).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => `${JSON.stringify(key)}:${stableSerializeValue(nestedValue)}`);

    return `{${entries.join(',')}}`;
  }

  return JSON.stringify(value);
};

export const serializeQueryKey = (queryKey: QueryKey): string =>
  queryKey.map(stableSerializeValue).join('|');

export const keyStartsWith = (queryKey: QueryKey, prefix: QueryKey): boolean => {
  if (prefix.length > queryKey.length) {
    return false;
  }

  return prefix.every((item, index) => stableSerializeValue(item) === stableSerializeValue(queryKey[index]));
};

export const normalizeMatchInput = (
  input?: QueryMatchInput | QueryKey
): QueryMatchInput | undefined => {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input)) {
    return { queryKey: input };
  }

  return input as QueryMatchInput;
};
