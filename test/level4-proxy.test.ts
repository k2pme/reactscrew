import { describe, expect, it, vi } from 'vitest';
import { createProxyAdapter } from '../src';

describe('createProxyAdapter', () => {
  it('rewrites URL with a matching prefix rule', async () => {
    const inner = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200, headers: {} });
    const proxy = createProxyAdapter(inner, [{ prefix: '/api', target: 'https://backend.example.com/v2' }]);

    await proxy({ method: 'GET', url: '/api/users', headers: {} });

    expect(inner).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://backend.example.com/v2/users' })
    );
  });

  it('passes URL through when no rule matches', async () => {
    const inner = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200, headers: {} });
    const proxy = createProxyAdapter(inner, [{ prefix: '/api', target: 'https://backend.example.com/v2' }]);

    await proxy({ method: 'GET', url: '/public/health', headers: {} });

    expect(inner).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/public/health' })
    );
  });

  it('accepts a custom resolver function', async () => {
    const inner = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200, headers: {} });
    const proxy = createProxyAdapter(inner, (url) => url.replace('/front-api/', '/api/v1/'));

    await proxy({ method: 'POST', url: '/front-api/users/create', headers: {}, data: { name: 'test' } });

    expect(inner).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/api/v1/users/create' })
    );
  });

  it('applies the first matching rule', async () => {
    const inner = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200, headers: {} });
    const proxy = createProxyAdapter(inner, [
      { prefix: '/api/v1', target: 'https://prod.example.com/v1' },
      { prefix: '/api', target: 'https://staging.example.com' }
    ]);

    await proxy({ method: 'GET', url: '/api/v1/users', headers: {} });

    expect(inner).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://prod.example.com/v1/users' })
    );
  });

  it('forwards all config properties', async () => {
    const inner = vi.fn().mockResolvedValue({ data: { ok: true }, status: 200, headers: {} });
    const proxy = createProxyAdapter(inner, [{ prefix: '/api', target: 'https://api.example.com' }]);
    const signal = new AbortController().signal;

    await proxy({ method: 'DELETE', url: '/api/users/1', headers: { 'X-Custom': 'val' }, data: undefined, signal });

    expect(inner).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'X-Custom': 'val' },
        signal
      })
    );
  });
});
