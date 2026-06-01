import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DriverProvider, ReactScrewError, useScrew, useScrewClient, useScrewQuery } from '../src';
import { normalizeError } from '../src/errors';

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

describe('DriverProvider', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
    localforageMock.getItem.mockResolvedValue(null);
  });

  it('renders children', () => {
    const api = vi.fn();
    const { getByText } = render(
      <DriverProvider apiInstance={api} screws={{}}>
        <div>hello</div>
      </DriverProvider>
    );
    expect(getByText('hello')).toBeDefined();
  });

  it('executes init on mount when executeOnLaunch is set', async () => {
    const api = vi.fn().mockResolvedValue({
      data: { ok: true },
      status: 200,
      headers: {}
    });

    render(
      <DriverProvider
        apiInstance={api}
        screws={{
          session: {
            name: 'session',
            executeOnLaunch: true,
            methods: {
              init: {
                type: 'query',
                route: '/session',
                httpMethod: 'GET'
              }
            }
          }
        }}
      >
        <div>app</div>
      </DriverProvider>
    );

    await waitFor(() => {
      expect(api).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/session', method: 'GET' })
      );
    });
  });
});

describe('useScrewClient', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
    localforageMock.getItem.mockResolvedValue(null);
  });

  it('returns the client instance', () => {
    const api = vi.fn();
    const { result } = renderHook(() => useScrewClient(), {
      wrapper: createWrapper(api, {})
    });
    expect(result.current).toBeDefined();
    expect(result.current.getMetrics).toBeDefined();
    expect(result.current.dehydrate).toBeDefined();
  });

  it('throws outside DriverProvider', () => {
    expect(() => renderHook(() => useScrewClient())).toThrow(ReactScrewError);
  });
});

describe('useScrew (legacy)', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
    localforageMock.getItem.mockResolvedValue(null);
  });

  it('returns idle state when screw has no init method', () => {
    const api = vi.fn();
    const { result } = renderHook(() => useScrew('user'), {
      wrapper: createWrapper(api, {
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
      })
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(api).not.toHaveBeenCalled();
  });

  it('fetches init method on mount and exposes data', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Legacy' }],
      status: 200,
      headers: {}
    });

    const { result } = renderHook(() => useScrew<{ id: number; name: string }[]>('user'), {
      wrapper: createWrapper(api, {
        user: {
          name: 'user',
          methods: {
            init: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            }
          }
        }
      })
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Legacy' }]);
    });

    expect(result.current.status).toBe('success');
  });

  it('exposes executeMethod for calling other methods', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Legacy' }],
      status: 200,
      headers: {}
    });

    const { result } = renderHook(() => useScrew('user'), {
      wrapper: createWrapper(api, {
        user: {
          name: 'user',
          methods: {
            init: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            },
            list: {
              type: 'query',
              route: '/users',
              httpMethod: 'GET'
            }
          }
        }
      })
    });

    await act(async () => {
      await result.current.executeMethod('list');
    });

    expect(api).toHaveBeenCalledTimes(2);
  });
});

describe('Error normalization', () => {
  it('creates ReactScrewError with code and message', () => {
    const err = new ReactScrewError('Something went wrong', { code: 'ERR_1' });
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe('ERR_1');
    expect(err.message).toBe('Something went wrong');
    expect(err.name).toBe('ReactScrewError');
  });

  it('normalizeError wraps a plain Error', () => {
    const normalized = normalizeError(new Error('net err'), 'Request failed.');
    expect(normalized.code).toBe('REQUEST_FAILED');
    expect(normalized.message).toBe('net err');
    expect(normalized.retryable).toBeUndefined();
  });

  it('normalizeError infers retryable from HTTP status', () => {
    const err = new Error('timeout');
    Object.assign(err, { response: { status: 429, data: {} } });
    const normalized = normalizeError(err, 'rate limited');
    expect(normalized.retryable).toBe(true);
  });

  it('normalizeError preserves existing ReactScrewError', () => {
    const original = new ReactScrewError('original', { code: 'KEEP' });
    const normalized = normalizeError(original, 'should not wrap');
    expect(normalized).toBe(original);
  });

  it('normalizeError reads documented error metadata', () => {
    const err = new Error('conflict');
    Object.assign(err, {
      response: { status: 409, data: { code: 'DUPLICATE', message: 'dupe' } }
    });
    const normalized = normalizeError(err, 'mutation failed', [
      { status: '409', code: 'DUPLICATE', description: 'Item exists.', retryable: false, uiHint: 'form' }
    ]);
    expect(normalized.description).toBe('Item exists.');
    expect(normalized.uiHint).toBe('form');
    expect(normalized.retryable).toBe(false);
  });
});

describe('Cache persistence', () => {
  beforeEach(() => {
    localforageMock.getItem.mockReset();
    localforageMock.setItem.mockReset();
  });

  it('persists and restores versioned cache via client methods', async () => {
    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Original' }],
      status: 200,
      headers: {}
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DriverProvider
        apiInstance={api}
        screws={{
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
        }}
        clientOptions={{ persist: { version: 'v1', namespace: 'rs' } }}
      >
        {children}
      </DriverProvider>
    );

    const { result } = renderHook(
      () => ({
        query: useScrewQuery<{ id: number; name: string }[]>('user', 'list'),
        client: useScrewClient()
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.query.data).toEqual([{ id: 1, name: 'Original' }]);
    });

    await act(async () => {
      await result.current.client.persistCache();
    });

    expect(localforageMock.setItem).toHaveBeenCalled();
  });

  it('skips restore when persisted version mismatches', async () => {
    localforageMock.getItem.mockResolvedValue({
      queries: [],
      mutations: [],
      meta: { persistedAt: Date.now(), version: 'v1' }
    });

    const api = vi.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Fresh' }],
      status: 200,
      headers: {}
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DriverProvider
        apiInstance={api}
        screws={{
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
        }}
        clientOptions={{ persist: { version: 'v2' } }}
      >
        {children}
      </DriverProvider>
    );

    const { result } = renderHook(() => useScrewQuery<{ id: number; name: string }[]>('user', 'list'), {
      wrapper
    });

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 1, name: 'Fresh' }]);
    });

    expect(api).toHaveBeenCalledTimes(1);
  });
});
