import { describe, expect, it, vi } from 'vitest';
import { executeWorkflow } from '../src';

const createClient = () => ({
  executeMutation: vi.fn().mockImplementation(async (_screw, method) => {
    if (method === 'fail') throw new Error('Step failed');
    if (method === 'slow') {
      await new Promise((r) => setTimeout(r, 10));
      return { ok: true };
    }
    return { id: 1 };
  })
} as unknown as Parameters<typeof executeWorkflow>[1]['client']);

describe('executeWorkflow', () => {
  it('executes sequential steps', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          { id: 'b', screwName: 'user', methodName: 'getProfile', dependsOn: ['a'] }
        ]
      },
      { client }
    );

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].status).toBe('success');
    expect(result.steps[1].status).toBe('success');
  });

  it('respects dependency ordering', async () => {
    const client = createClient();
    const order: string[] = [];
    client.executeMutation = vi.fn().mockImplementation(async (_screw, method) => {
      order.push(method);
      return { id: 1 };
    });

    await executeWorkflow(
      {
        steps: [
          { id: 'first', screwName: 'user', methodName: 'login' },
          { id: 'second', screwName: 'user', methodName: 'getProfile', dependsOn: ['first'] }
        ]
      },
      { client }
    );

    expect(order).toEqual(['login', 'getProfile']);
  });

  it('executes parallel steps', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          { id: 'b', screwName: 'user', methodName: 'getProfile', parallel: true },
          { id: 'c', screwName: 'user', methodName: 'getSettings', parallel: true }
        ]
      },
      { client }
    );

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(3);
  });

  it('retries failed steps', async () => {
    let attempts = 0;
    const client = {
      executeMutation: vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Temporary failure');
        return { ok: true };
      })
    } as unknown as Parameters<typeof executeWorkflow>[1]['client'];

    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login', retry: 3, retryDelay: 1 }
        ]
      },
      { client }
    );

    expect(result.status).toBe('completed');
    expect(result.steps[0].retries).toBe(2);
  });

  it('reports blocking failure', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          { id: 'b', screwName: 'user', methodName: 'fail', dependsOn: ['a'] }
        ]
      },
      { client }
    );

    expect(result.status).toBe('failed');
    expect(result.steps[1].status).toBe('error');
  });

  it('reports progress via callback', async () => {
    const client = createClient();
    const onProgress = vi.fn();

    await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          { id: 'b', screwName: 'user', methodName: 'slow' }
        ]
      },
      { client, onProgress }
    );

    expect(onProgress).toHaveBeenCalled();
    const calls = onProgress.mock.calls;
    expect(calls[0][0].percentage).toBe(0);
    expect(calls[calls.length - 1][0].percentage).toBe(100);
  });
});
