import { describe, expect, it, vi } from 'vitest';
import { executeBatch } from '../src';

const createClient = (results: unknown[] = []) => ({
  executeMutation: vi.fn().mockImplementation(async (_screw, _method, variables) => {
    const next = results.shift();
    if (next instanceof Error) throw next;
    return next ?? variables;
  })
} as unknown as Parameters<typeof executeBatch>[1]['client']);

describe('executeBatch', () => {
  it('executes all actions and returns summary', async () => {
    const client = createClient();
    const result = await executeBatch(
      [
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } },
        { screwName: 'user', methodName: 'create', variables: { name: 'B' } }
      ],
      { client }
    );

    expect(result.summary.total).toBe(2);
    expect(result.summary.succeeded).toBe(2);
    expect(result.summary.failed).toBe(0);
    expect(result.status).toBe('completed');
    expect(client.executeMutation).toHaveBeenCalledTimes(2);
  });

  it('reports partial failures', async () => {
    const client = createClient([{ id: 1 }, new Error('DB error')]);
    const result = await executeBatch(
      [
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } },
        { screwName: 'user', methodName: 'create', variables: { name: 'B' } }
      ],
      { client }
    );

    expect(result.summary.succeeded).toBe(1);
    expect(result.summary.failed).toBe(1);
    expect(result.status).toBe('partial');
    expect(result.steps[1].error?.message).toBe('DB error');
  });

  it('reports progress via callback', async () => {
    const client = createClient();
    const onProgress = vi.fn();
    const actions = [
      { screwName: 'user', methodName: 'create', variables: { name: 'A' } },
      { screwName: 'user', methodName: 'create', variables: { name: 'B' } },
      { screwName: 'user', methodName: 'create', variables: { name: 'C' } }
    ];

    await executeBatch(actions, { client, onProgress });

    expect(onProgress).toHaveBeenCalled();
    const calls = onProgress.mock.calls;
    expect(calls[0][0].percentage).toBe(0);
    expect(calls[calls.length - 1][0].percentage).toBe(100);
    expect(calls[calls.length - 1][0].phase).toBe('completed');
  });

  it('handles empty action list', async () => {
    const client = createClient();
    const result = await executeBatch([], { client });

    expect(result.summary.total).toBe(0);
    expect(result.status).toBe('completed');
  });
});
