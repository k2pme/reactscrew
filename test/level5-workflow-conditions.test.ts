import { describe, expect, it, vi } from 'vitest';
import { executeWorkflow } from '../src';

const createClient = (querySnapshots?: unknown[]) => ({
  executeMutation: vi.fn().mockImplementation(async (_screw: string, method: string) => {
    if (method === 'fail') throw new Error('Blocking failure');
    return { id: 1 };
  }),
  getQuerySnapshots: vi.fn().mockReturnValue(querySnapshots ?? []),
} as unknown as Parameters<typeof executeWorkflow>[1]['client']);

describe('executeWorkflow — conditions', () => {
  it('skips step when condition returns false', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          {
            id: 'b',
            screwName: 'user',
            methodName: 'getProfile',
            dependsOn: ['a'],
            condition: () => false,
          },
          {
            id: 'c',
            screwName: 'user',
            methodName: 'complete',
            dependsOn: ['a'],
          },
        ],
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps[1].status).toBe('skipped');
    expect(result.steps[2].status).toBe('success');
    expect(client.executeMutation).toHaveBeenCalledTimes(2);
  });

  it('executes step when condition returns true', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          {
            id: 'b',
            screwName: 'user',
            methodName: 'getProfile',
            dependsOn: ['a'],
            condition: () => true,
          },
        ],
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps[1].status).toBe('success');
  });

  it('passes stepResults to condition', async () => {
    const client = createClient();
    const conditionFn = vi.fn().mockReturnValue(true);
    await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
          {
            id: 'b',
            screwName: 'user',
            methodName: 'getProfile',
            dependsOn: ['a'],
            condition: conditionFn,
          },
        ],
      },
      { client },
    );

    expect(conditionFn).toHaveBeenCalled();
    const ctx = conditionFn.mock.calls[0][0];
    expect(ctx.stepResults.a).toBeDefined();
    expect(ctx.stepResults.a.status).toBe('success');
  });

  it('uses getScrewData in condition', async () => {
    const client = createClient([
      { queryKey: ['cart', 'get'], state: { data: { items: [{ id: 1 }] } } },
    ]);
    const result = await executeWorkflow(
      {
        steps: [
          {
            id: 'checkout',
            screwName: 'orders',
            methodName: 'checkout',
            condition: (ctx) => {
              const cart = ctx.getScrewData<any>('cart', 'get');
              return cart && cart.items && cart.items.length > 0;
            },
          },
        ],
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps[0].status).toBe('success');
  });

  it('waits when waitForCondition is true and condition fails', async () => {
    let callCount = 0;
    const client = createClient();
    const conditionFn = vi.fn().mockImplementation(() => {
      callCount++;
      return callCount >= 2;
    });

    const result = await executeWorkflow(
      {
        steps: [
          {
            id: 'waitStep',
            screwName: 'user',
            methodName: 'login',
            waitForCondition: true,
            condition: conditionFn,
          },
        ],
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(conditionFn).toHaveBeenCalledTimes(2);
  }, 10000);

  it('returns partial status when waitForCondition never passes', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          {
            id: 'neverReady',
            screwName: 'user',
            methodName: 'login',
            waitForCondition: true,
            condition: () => false,
          },
        ],
      },
      { client },
    );

    expect(result.status).toBe('partial');
  }, 35000);

  it('injects variables into condition context', async () => {
    const conditionFn = vi.fn().mockReturnValue(true);
    const client = createClient();
    await executeWorkflow(
      {
        steps: [
          {
            id: 'varStep',
            screwName: 'user',
            methodName: 'login',
            condition: conditionFn,
          },
        ],
        variables: { role: 'admin', threshold: 100 },
      },
      { client },
    );

    expect(conditionFn).toHaveBeenCalled();
    const ctx = conditionFn.mock.calls[0][0];
    expect(ctx.variables).toBeDefined();
    expect(ctx.variables?.role).toBe('admin');
    expect(ctx.variables?.threshold).toBe(100);
  });

  it('uses workflow-level condition to block execution when false', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
        ],
        condition: () => false,
      },
      { client },
    );

    expect(result.status).toBe('partial');
    expect(result.steps).toHaveLength(0);
    expect(client.executeMutation).not.toHaveBeenCalled();
  });

  it('uses workflow-level condition to allow execution when true', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
        ],
        condition: () => true,
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].status).toBe('success');
  });

  it('passes injected variables to workflow-level condition', async () => {
    const conditionFn = vi.fn().mockReturnValue(true);
    const client = createClient();
    await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
        ],
        condition: conditionFn,
        variables: { mode: 'test', retries: 3 },
      },
      { client },
    );

    expect(conditionFn).toHaveBeenCalled();
    const ctx = conditionFn.mock.calls[0][0];
    expect(ctx.variables?.mode).toBe('test');
    expect(ctx.variables?.retries).toBe(3);
  });

  it('waits when workflow-level waitForCondition is true and condition fails', async () => {
    let callCount = 0;
    const client = createClient();
    const conditionFn = vi.fn().mockImplementation(() => {
      callCount++;
      return callCount >= 2;
    });

    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
        ],
        condition: conditionFn,
        waitForCondition: true,
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps).toHaveLength(1);
    expect(conditionFn).toHaveBeenCalledTimes(2);
  });

  it('returns partial when workflow-level waitForCondition never passes', async () => {
    const client = createClient();
    const result = await executeWorkflow(
      {
        steps: [
          { id: 'a', screwName: 'user', methodName: 'login' },
        ],
        condition: () => false,
        waitForCondition: true,
      },
      { client },
    );

    expect(result.status).toBe('partial');
  }, 35000);

  it('reads screw data in workflow-level condition', async () => {
    const client = createClient([
      { queryKey: ['cart', 'get'], state: { data: { items: [{ id: 1 }] } } },
    ]);
    const conditionFn = vi.fn().mockImplementation((ctx: { getScrewData: Function }) => {
      const cart = ctx.getScrewData('cart', 'get') as { items?: unknown[] };
      return cart && cart.items && cart.items.length > 0;
    });

    const result = await executeWorkflow(
      {
        steps: [
          { id: 'checkout', screwName: 'orders', methodName: 'checkout' },
        ],
        condition: conditionFn,
      },
      { client },
    );

    expect(result.status).toBe('completed');
    expect(result.steps[0].status).toBe('success');
  });

  it('calls onStepCondition callback', async () => {
    const client = createClient();
    const onStepCondition = vi.fn();
    await executeWorkflow(
      {
        steps: [
          {
            id: 'condStep',
            screwName: 'user',
            methodName: 'login',
            condition: () => false,
          },
        ],
        onStepCondition,
      },
      { client },
    );

    expect(onStepCondition).toHaveBeenCalledWith({
      stepId: 'condStep',
      passed: false,
      skipped: true,
    });
  });
});
