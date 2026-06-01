import type { ApiInstance, ApiRequestConfig, ApiResponse } from '../types';

export interface AxiosLikeInstance {
  request: (config: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    data?: unknown;
    signal?: AbortSignal;
  }) => Promise<{
    data: unknown;
    status: number;
    headers: Record<string, unknown>;
  }>;
}

const headersToRecord = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

export const createFetchAdapter = (
  baseUrl = '',
  defaultHeaders: Record<string, string> = {}
): ApiInstance => {
  return async ({ method, url, headers, data, signal }) => {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...defaultHeaders,
        ...headers,
        ...(data !== undefined ? { 'Content-Type': 'application/json' } : {})
      },
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal
    });

    const contentType = response.headers.get('content-type') ?? '';
    const parsedData = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`) as Error & {
        response?: ApiResponse;
      };

      error.response = {
        data: parsedData,
        status: response.status,
        headers: headersToRecord(response.headers)
      };

      throw error;
    }

    return {
      data: parsedData,
      status: response.status,
      headers: headersToRecord(response.headers)
    };
  };
};

export const createAxiosAdapter = (instance: AxiosLikeInstance): ApiInstance => {
  return async <TData = unknown>({
    method,
    url,
    headers,
    data,
    signal
  }: ApiRequestConfig) => {
    const response = await instance.request({
      method,
      url,
      headers,
      data,
      signal
    });

    return {
      data: response.data as TData,
      status: response.status,
      headers: response.headers as Record<string, unknown>
    };
  };
};
