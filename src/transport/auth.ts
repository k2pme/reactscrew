import { normalizeError } from '../errors';
import type { ApiInstance, AuthStrategy } from '../types';

export const withAuthStrategy = (
  apiInstance: ApiInstance,
  strategy: AuthStrategy
): ApiInstance => {
  return async (config) => {
    const headerName = strategy.headerName ?? 'Authorization';
    const headerPrefix = strategy.headerPrefix ?? 'Bearer';
    const token = await strategy.getAccessToken?.();

    const buildHeaders = (accessToken: string | null | undefined) => ({
      ...config.headers,
      ...(accessToken ? { [headerName]: `${headerPrefix} ${accessToken}` } : {})
    });

    try {
      return await apiInstance({
        ...config,
        headers: buildHeaders(token)
      });
    } catch (error) {
      const normalized = normalizeError(error, 'Authenticated request failed.');

      if (normalized.status !== 401 || !strategy.refreshAccessToken) {
        await strategy.onAuthFailure?.(normalized);
        throw normalized;
      }

      const refreshedToken = await strategy.refreshAccessToken();

      if (!refreshedToken) {
        await strategy.onAuthFailure?.(normalized);
        throw normalized;
      }

      return apiInstance({
        ...config,
        headers: buildHeaders(refreshedToken)
      });
    }
  };
};
