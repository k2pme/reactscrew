import { describe, expect, it, vi } from 'vitest';
import { withOpenTelemetry } from '../src';

describe('withOpenTelemetry', () => {
  it('creates spans for query:start and ends on query:success', () => {
    const end = vi.fn();
    const setAttribute = vi.fn();
    const setStatus = vi.fn();
    const addEvent = vi.fn();
    const tracer = {
      startActiveSpan: vi.fn().mockImplementation(async (_name, fn) => {
        return fn({ setAttribute, setStatus, end, addEvent });
      })
    };
    const subscribe = vi.fn();

    withOpenTelemetry({ subscribeEvents: subscribe } as never, tracer);

    const handler = subscribe.mock.calls[0][0];

    handler({ type: 'query:start', screwName: 'user', methodName: 'list', timestamp: Date.now() });
    handler({ type: 'query:success', screwName: 'user', methodName: 'list', timestamp: Date.now(), durationMs: 150 });

    expect(tracer.startActiveSpan).toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });

  it('sets error status on query:error', () => {
    const end = vi.fn();
    const setAttribute = vi.fn();
    const setStatus = vi.fn();
    const addEvent = vi.fn();
    const tracer = {
      startActiveSpan: vi.fn().mockImplementation(async (_name, fn) => {
        return fn({ setAttribute, setStatus, end, addEvent });
      })
    };
    const subscribe = vi.fn();

    withOpenTelemetry({ subscribeEvents: subscribe } as never, tracer);

    const handler = subscribe.mock.calls[0][0];

    handler({ type: 'query:start', screwName: 'user', methodName: 'list', timestamp: Date.now() });
    handler({
      type: 'query:error',
      screwName: 'user',
      methodName: 'list',
      timestamp: Date.now(),
      durationMs: 50,
      error: { message: 'Failed', code: 'ERR' }
    });

    expect(setStatus).toHaveBeenCalledWith({ code: 2, message: 'Failed' });
    expect(addEvent).toHaveBeenCalled();
    expect(end).toHaveBeenCalled();
  });
});
