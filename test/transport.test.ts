import { describe, expect, it, vi } from 'vitest';
import { createAxiosAdapter, createFetchAdapter } from '../src';

describe('transport adapters', () => {
  it('creates a fetch adapter', async () => {
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

    const adapter = createFetchAdapter('https://api.example.com', {
      Authorization: 'Bearer token'
    });
    const response = await adapter({
      method: 'GET',
      url: '/users'
    });

    expect(response.data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/users', {
      method: 'GET',
      headers: { Authorization: 'Bearer token' },
      body: undefined,
      signal: undefined
    });
  });

  it('creates an axios adapter', async () => {
    const instance = {
      request: vi.fn().mockResolvedValue({
        data: { ok: true },
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    };

    const adapter = createAxiosAdapter(instance);
    const response = await adapter({
      method: 'POST',
      url: '/users',
      data: { name: 'Jane' }
    });

    expect(response.data).toEqual({ ok: true });
    expect(instance.request).toHaveBeenCalledWith({
      method: 'POST',
      url: '/users',
      headers: undefined,
      data: { name: 'Jane' },
      signal: undefined
    });
  });
});
