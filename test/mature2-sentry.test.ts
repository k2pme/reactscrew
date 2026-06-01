import { describe, expect, it, vi } from 'vitest';
import { withSentry } from '../src';

describe('withSentry', () => {
  it('adds breadcrumbs for all events', () => {
    const addBreadcrumb = vi.fn();
    const captureException = vi.fn();
    const sentry = { addBreadcrumb, captureException };
    const subscribe = vi.fn();

    withSentry({ subscribeEvents: subscribe } as never, sentry);

    const handler = subscribe.mock.calls[0][0];
    handler({ type: 'query:success', screwName: 'user', methodName: 'list', timestamp: Date.now() });

    expect(addBreadcrumb).toHaveBeenCalled();
  });

  it('captures exceptions on error events', () => {
    const addBreadcrumb = vi.fn();
    const captureException = vi.fn();
    const sentry = { addBreadcrumb, captureException };
    const subscribe = vi.fn();

    withSentry({ subscribeEvents: subscribe } as never, sentry);

    const handler = subscribe.mock.calls[0][0];
    handler({
      type: 'query:error',
      screwName: 'user',
      methodName: 'list',
      timestamp: Date.now(),
      error: { message: 'Not found', code: 'ERR_404' }
    });

    expect(captureException).toHaveBeenCalled();
  });

  it('returns an unsubscribe function', () => {
    const unsub = vi.fn();
    const subscribe = vi.fn(() => unsub);
    const sentry = { addBreadcrumb: vi.fn(), captureException: vi.fn() };

    const result = withSentry({ subscribeEvents: subscribe } as never, sentry);

    result();
    expect(unsub).toHaveBeenCalled();
  });
});
