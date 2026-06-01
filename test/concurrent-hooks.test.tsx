import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DriverProvider,
  ReactScrewError,
  useScrew,
  useScrewMutation,
  useScrewQuery
} from '../src';

const localforageMock = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn()
}));

vi.mock('localforage', () => ({
  default: localforageMock
}));

const createWrapper = (apiInstance: ReturnType<typeof vi.fn>, screws: Record<string, unknown>) => {
  return ({ children }: { children: React.ReactNode }) => (
    <DriverProvider apiInstance={apiInstance} screws={screws as never}>
      {children}
    </DriverProvider>
  );
};

describe('CONCURRENT query and mutation hooks', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
  });

  it('dedupes concurrent query subscriptions and exposes query state', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Jane' }],
      status: 200,
      headers: {}
    });

    const screws = {
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
    };

    const wrapper = createWrapper(api, screws);

    const { result } = renderHook(
      () => ({
        first: useScrewQuery<{ id: number; name: string }[]>('user', 'list'),
        second: useScrewQuery<{ id: number; name: string }[]>('user', 'list')
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.first.status).toBe('success');
    });

    expect(result.current.first.data).toEqual([{ id: 1, name: 'Jane' }]);
    expect(result.current.second.data).toEqual([{ id: 1, name: 'Jane' }]);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it('invalidates queries after mutation and updates cached data optimistically', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane' }],
        status: 200,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: { id: 2, name: 'John' },
        status: 201,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: [
          { id: 1, name: 'Jane' },
          { id: 2, name: 'John' }
        ],
        status: 200,
        headers: {}
      });

    const screws = {
      user: {
        name: 'user',
        methods: {
          list: {
            type: 'query',
            route: '/users',
            httpMethod: 'GET'
          },
          create: {
            type: 'mutation',
            route: '/users',
            httpMethod: 'POST',
            invalidateQueries: [{ screwName: 'user', methodName: 'list' }]
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => ({
        query: useScrewQuery<{ id: number; name: string }[]>('user', 'list'),
        mutation: useScrewMutation<{ id: number; name: string }, { id: number; name: string }>(
          'user',
          'create',
          {
            optimisticUpdate: ({ client, variables }) => {
              const previous = client.getQueryData<{ id: number; name: string }[]>([
                'user',
                'list'
              ]);

              client.setQueryData<{ id: number; name: string }[]>(['user', 'list'], (current) => [
                ...(current ?? []),
                variables
              ]);

              return {
                rollback: () => {
                  client.setQueryData(['user', 'list'], previous ?? []);
                }
              };
            }
          }
        )
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Jane' }]);
    });

    await act(async () => {
      await result.current.mutation.mutateAsync({ id: 2, name: 'John' });
    });

    expect(result.current.query.data).toEqual([
      { id: 1, name: 'Jane' },
      { id: 2, name: 'John' }
    ]);
    expect(result.current.mutation.status).toBe('success');
    expect(api).toHaveBeenCalledTimes(3);
  });

  it('rolls back optimistic updates when a mutation fails', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane' }],
        status: 200,
        headers: {}
      })
      .mockRejectedValueOnce(new Error('Write failed'));

    const screws = {
      user: {
        name: 'user',
        methods: {
          list: {
            type: 'query',
            route: '/users',
            httpMethod: 'GET'
          },
          create: {
            type: 'mutation',
            route: '/users',
            httpMethod: 'POST'
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => ({
        query: useScrewQuery<{ id: number; name: string }[]>('user', 'list'),
        mutation: useScrewMutation<{ id: number; name: string }, { id: number; name: string }>(
          'user',
          'create',
          {
            optimisticUpdate: ({ client, variables }) => {
              const previous = client.getQueryData<{ id: number; name: string }[]>([
                'user',
                'list'
              ]);

              client.setQueryData<{ id: number; name: string }[]>(['user', 'list'], (current) => [
                ...(current ?? []),
                variables
              ]);

              return {
                rollback: () => {
                  client.setQueryData(['user', 'list'], previous ?? []);
                }
              };
            }
          }
        )
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Jane' }]);
    });

    await expect(result.current.mutation.mutateAsync({ id: 2, name: 'John' })).rejects.toThrow(
      'Write failed'
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Jane' }]);
    });

    expect(result.current.mutation.status).toBe('error');
  });

  it('refetches active queries on window focus and reconnect', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane' }],
        status: 200,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane 2' }],
        status: 200,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane 3' }],
        status: 200,
        headers: {}
      });

    const screws = {
      user: {
        name: 'user',
        methods: {
          list: {
            type: 'query',
            route: '/users',
            httpMethod: 'GET',
            refetchOnWindowFocus: true,
            refetchOnReconnect: true
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => useScrewQuery<{ id: number; name: string }[]>('user', 'list'),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Jane' }]);
    });

    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Jane 2' }]);
    });

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Jane 3' }]);
    });
  });

  it('aborts obsolete forced refetches and keeps the latest result', async () => {
    let firstRequestAborted = false;
    let callCount = 0;

    const api = vi.fn().mockImplementation(({ signal }: { signal?: AbortSignal }) => {
      callCount += 1;

      if (callCount === 1) {
        return new Promise((_, reject) => {
          if (signal?.aborted) {
            firstRequestAborted = true;
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            reject(abortError);
            return;
          }

          signal?.addEventListener('abort', () => {
            firstRequestAborted = true;
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        });
      }

      return Promise.resolve({
        data: [{ id: 2, name: 'Latest' }],
        status: 200,
        headers: {}
      });
    });

    const screws = {
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
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => useScrewQuery<{ id: number; name: string }[]>('user', 'list', { enabled: false }),
      { wrapper }
    );

    const firstRefetch = result.current.refetch();
    const secondRefetch = result.current.refetch();

    void firstRefetch.catch(() => undefined);
    await expect(secondRefetch).resolves.toEqual([{ id: 2, name: 'Latest' }]);

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 2, name: 'Latest' }]);
    });

    expect(firstRequestAborted).toBe(true);
  });

  it('normalizes validation failures at runtime', async () => {
    const api = vi.fn();
    const screws = {
      user: {
        name: 'user',
        methods: {
          getById: {
            type: 'query',
            route: (id: number) => `/users/${id}`,
            httpMethod: 'GET',
            paramsValidator: ([id]: unknown[]) => {
              if (typeof id !== 'number') {
                throw new Error('id must be a number');
              }
              return [id];
            }
          },
          create: {
            type: 'mutation',
            route: '/users',
            httpMethod: 'POST',
            bodyValidator: (body: { name?: string } | undefined) => {
              if (!body?.name) {
                throw new Error('name is required');
              }
              return body;
            }
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => ({
        query: useScrewQuery('user', 'getById', { args: ['bad-id'], enabled: false }),
        mutation: useScrewMutation('user', 'create')
      }),
      { wrapper }
    );

    await expect(result.current.query.refetch()).rejects.toMatchObject({
      code: 'QUERY_PARAMS_VALIDATION_FAILED'
    });

    await waitFor(() => {
      expect(result.current.query.error).toBeInstanceOf(ReactScrewError);
    });

    expect(result.current.query.error).toMatchObject({
      code: 'QUERY_PARAMS_VALIDATION_FAILED'
    });

    await expect(result.current.mutation.mutateAsync({})).rejects.toMatchObject({
      code: 'MUTATION_BODY_VALIDATION_FAILED'
    });
  });

  it('validates responses and applies documented error metadata', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'bad-id' },
        status: 200,
        headers: {}
      })
      .mockRejectedValueOnce(
        Object.assign(new Error('Conflict'), {
          response: {
            status: 409,
            data: {
              code: 'USER_CREATE_409',
              message: 'User already exists'
            }
          }
        })
      );

    const screws = {
      user: {
        name: 'user',
        methods: {
          getById: {
            type: 'query',
            route: '/users/1',
            httpMethod: 'GET',
            responseValidator: (value: { id: number }) => {
              if (typeof value.id !== 'number') {
                throw new Error('invalid id');
              }

              return value;
            }
          },
          create: {
            type: 'mutation',
            route: '/users',
            httpMethod: 'POST',
            documentedErrors: [
              {
                status: '409',
                code: 'USER_CREATE_409',
                description: 'User creation conflicts with an existing account.',
                retryable: false,
                uiHint: 'form'
              }
            ]
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(
      () => ({
        query: useScrewQuery('user', 'getById', { enabled: false }),
        mutation: useScrewMutation('user', 'create')
      }),
      { wrapper }
    );

    await expect(result.current.query.refetch()).rejects.toMatchObject({
      code: 'QUERY_RESPONSE_VALIDATION_FAILED'
    });

    await expect(result.current.mutation.mutateAsync({ name: 'Jane' })).rejects.toMatchObject({
      code: 'USER_CREATE_409',
      description: 'User creation conflicts with an existing account.',
      retryable: false,
      uiHint: 'form'
    });
  });

  it('keeps legacy useScrew working for init plus executeMethod', async () => {
    const api = vi
      .fn()
      .mockResolvedValueOnce({
        data: [{ id: 1, name: 'Jane' }],
        status: 200,
        headers: {}
      })
      .mockResolvedValueOnce({
        data: { id: 2, name: 'John' },
        status: 201,
        headers: {}
      });

    const screws = {
      user: {
        name: 'user',
        methods: {
          init: {
            route: '/users',
            httpMethod: 'GET'
          },
          create: {
            route: '/users',
            httpMethod: 'POST'
          }
        }
      }
    };

    const wrapper = createWrapper(api, screws);
    const { result } = renderHook(() => useScrew<{ id: number; name: string }[]>('user'), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Jane' }]);
    });

    await act(async () => {
      await result.current.executeMethod('create', { id: 2, name: 'John' });
    });

    expect(api).toHaveBeenNthCalledWith(1, {
      method: 'GET',
      url: '/users',
      headers: undefined,
      signal: expect.any(AbortSignal)
    });
    expect(api).toHaveBeenNthCalledWith(2, {
      method: 'POST',
      url: '/users',
      headers: undefined,
      data: { id: 2, name: 'John' }
    });
  });
});
