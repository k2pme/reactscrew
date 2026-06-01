import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DriverProvider,
  createFetchAdapter,
  generateScrewsFromOpenApiDocument,
  useInfiniteScrewQuery,
  useScrewClient,
  useScrewDevtools,
  useScrewEvents,
  useScrewQuery,
  withAuthStrategy
} from '../src';
import type { DehydratedState, RequestEvent } from '../src/types';

const localforageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn()
}));

vi.mock('localforage', () => ({
  default: localforageMock
}));

const createWrapper = (
  apiInstance: ReturnType<typeof vi.fn> | ((config: unknown) => Promise<unknown>),
  screws: Record<string, unknown>,
  options?: Record<string, unknown>
) => {
  return ({ children }: { children: React.ReactNode }) => (
    <DriverProvider
      apiInstance={apiInstance as never}
      screws={screws as never}
      {...(options ?? {})}
    >
      {children}
    </DriverProvider>
  );
};

describe('MATURE features', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
  });

  it('hydrates dehydrated state without refetching immediately', async () => {
    const api = vi.fn();
    const dehydratedState: DehydratedState = {
      queries: [
        {
          queryKey: ['user', 'init'],
          screwName: 'user',
          methodName: 'init',
          args: [],
          state: {
            status: 'success',
            data: [{ id: 1, name: 'SSR User' }],
            error: null,
            isLoading: false,
            isFetching: false,
            isRefetching: false,
            updatedAt: Date.now(),
            invalidatedAt: null
          },
          staleTime: 1000,
          cacheTime: 5000,
          refetchOnWindowFocus: true,
          refetchOnReconnect: true
        }
      ],
      mutations: [],
      meta: {
        persistedAt: Date.now(),
        version: 'v1'
      }
    };

    const wrapper = createWrapper(
      api,
      {
        user: {
          name: 'user',
          executeOnLaunch: true,
          methods: {
            init: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            }
          }
        }
      },
      {
        dehydratedState,
        clientOptions: { persist: { version: 'v1' } }
      }
    );

    const { result } = renderHook(() => useScrewQuery<{ id: number; name: string }[]>('user', 'init'), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'SSR User' }]);
    });

    expect(api).not.toHaveBeenCalled();
  });

  it('exposes devtools snapshots and events', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Observed' }],
      status: 200,
      headers: {}
    });
    const events: RequestEvent[] = [];

    const wrapper = createWrapper(
      api,
      {
        user: {
          name: 'user',
          methods: {
            list: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            }
          }
        }
      },
      {
        clientOptions: {
          observer: {
            onEvent: (event: RequestEvent) => {
              events.push(event);
            }
          }
        }
      }
    );

    const { result } = renderHook(
      () => {
        useScrewEvents((event) => {
          events.push(event);
        });

        return {
          query: useScrewQuery('user', 'list'),
          devtools: useScrewDevtools()
        };
      },
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Observed' }]);
    });

    expect(result.current.devtools.queries.length).toBeGreaterThan(0);
    expect(result.current.devtools.metrics.networkRequests).toBeGreaterThanOrEqual(1);
    expect(events.some((event) => event.type === 'query:success')).toBe(true);
  });

  it('supports infinite queries', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1 }],
        status: 200,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: [{ id: 2 }],
        status: 200,
        headers: {}
      });

    const wrapper = createWrapper(api, {
      post: {
        name: 'post',
        methods: {
          list: {
            type: 'query',
            route: (page = 1) => `/posts?page=${page}`,
            httpMethod: 'GET'
          }
        }
      }
    });

    const { result } = renderHook(
      () =>
        useInfiniteScrewQuery<{ id: number }, number>('post', 'list', {
          initialPageParam: 1,
          getNextPageParam: (_lastPage, _allPages, lastPageParam) =>
            lastPageParam < 2 ? lastPageParam + 1 : undefined
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([[{ id: 1 }]]);
    });

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(result.current.data).toEqual([[{ id: 1 }], [{ id: 2 }]]);
    expect(result.current.pageParams).toEqual([1, 2]);
  });

  it('persists and restores versioned cache', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Persisted' }],
      status: 200,
      headers: {}
    });

    const wrapper = createWrapper(
      api,
      {
        user: {
          name: 'user',
          methods: {
            list: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            }
          }
        }
      },
      {
        clientOptions: {
          persist: {
            version: 'v2',
            namespace: 'rs'
          }
        }
      }
    );

    const { result } = renderHook(
      () => ({
        query: useScrewQuery('user', 'list'),
        client: useScrewClient()
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Persisted' }]);
    });

    await act(async () => {
      await result.current.client.persistCache();
    });

    expect(localforageMock.setItem).toHaveBeenCalled();
  });

  it('retries a 401 request through auth refresh', async () => {
    const baseApi = vi
      .fn()
      .mockRejectedValueOnce(
        Object.assign(new Error('Unauthorized'), {
          response: {
            status: 401,
            data: {}
          }
        })
      )
      .mockResolvedValueOnce({
        data: { ok: true },
        status: 200,
        headers: {}
      });

    const authApi = withAuthStrategy(baseApi, {
      getAccessToken: async () => 'token-a',
      refreshAccessToken: async () => 'token-b'
    });

    const response = await authApi({
      method: 'GET',
      url: '/secure'
    });

    expect(response.data).toEqual({ ok: true });
    expect(baseApi).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token-b'
        }
      })
    );
  });

  it('generates screws from an OpenAPI document', () => {
    const source = generateScrewsFromOpenApiDocument({
      paths: {
        '/users': {
          get: { operationId: 'listUsers' },
          post: { operationId: 'createUser' }
        }
      }
    });

    expect(source).toContain("export const usersScrew");
    expect(source).toContain("listUsers");
    expect(source).toContain("createUser");
  });

  it('creates a browser fetch adapter for SSR-compatible flows', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
        forEach: (cb: (value: string, key: string) => void) => cb('application/json', 'content-type')
      },
      json: async () => ({ ok: true })
    });

    vi.stubGlobal('fetch', fetchMock);

    const adapter = createFetchAdapter('https://api.example.com');
    const response = await adapter({
      method: 'GET',
      url: '/ssr'
    });

    expect(response.data).toEqual({ ok: true });
  });
});
