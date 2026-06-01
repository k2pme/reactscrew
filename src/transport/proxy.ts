'use client';

import type { ApiInstance, ApiRequestConfig } from '../types';

export interface ProxyRule {
  prefix: string;
  target: string;
}

export type ProxyUrlResolver = (url: string) => string;

export const createProxyAdapter = (
  apiInstance: ApiInstance,
  rulesOrResolver: ProxyRule[] | ProxyUrlResolver
): ApiInstance => {
  const resolveUrl = Array.isArray(rulesOrResolver)
    ? (url: string): string => {
        const rule = rulesOrResolver.find((r) => url.startsWith(r.prefix));
        if (!rule) return url;
        return url.replace(rule.prefix, rule.target);
      }
    : rulesOrResolver;

  return async <TData = unknown>(config: ApiRequestConfig): Promise<{ data: TData; status: number; headers: Record<string, unknown> }> => {
    const resolvedUrl = resolveUrl(config.url ?? '');
    return apiInstance({
      ...config,
      url: resolvedUrl
    }) as Promise<{ data: TData; status: number; headers: Record<string, unknown> }>;
  };
};
