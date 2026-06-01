import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DriverProvider, useScrewBatch, useScrewWorkflow, useScrewProgress } from '../src';

const api = vi.fn().mockResolvedValue({ data: { id: 1 }, status: 200, headers: {} });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <DriverProvider
    apiInstance={api}
    screws={{
      user: {
        name: 'user',
        methods: {
          create: { type: 'mutation', route: '/users', httpMethod: 'POST' },
          login: { type: 'mutation', route: '/login', httpMethod: 'POST' },
          getProfile: { type: 'mutation', route: '/profile', httpMethod: 'GET' }
        }
      }
    }}
    clientOptions={{}}
  >
    {children}
  </DriverProvider>
);

describe('useScrewBatch', () => {
  it('executes a batch and returns result', async () => {
    const { result } = renderHook(
      () => useScrewBatch(),
      { wrapper }
    );

    act(() => {
      result.current.execute([
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } },
        { screwName: 'user', methodName: 'create', variables: { name: 'B' } }
      ]);
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.summary.total).toBe(2);
    expect(result.current.result!.summary.succeeded).toBe(2);
  });

  it('tracks progress during execution', async () => {
    const { result } = renderHook(
      () => useScrewBatch(),
      { wrapper }
    );

    act(() => {
      result.current.execute([
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } },
        { screwName: 'user', methodName: 'create', variables: { name: 'B' } }
      ]);
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(result.current.progress?.percentage).toBe(100);
  });

  it('resets state', async () => {
    const { result } = renderHook(
      () => useScrewBatch(),
      { wrapper }
    );

    act(() => {
      result.current.execute([
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } }
      ]);
    });

    await waitFor(() => {
      expect(result.current.result).not.toBeNull();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(result.current.isExecuting).toBe(false);
  });
});

describe('useScrewWorkflow', () => {
  it('executes a workflow with dependencies', async () => {
    const { result } = renderHook(
      () => useScrewWorkflow(),
      { wrapper }
    );

    act(() => {
      result.current.execute([
        { id: 'login', screwName: 'user', methodName: 'login' },
        { id: 'profile', screwName: 'user', methodName: 'getProfile', dependsOn: ['login'] }
      ]);
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });

    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.status).toBe('completed');
    expect(result.current.result!.steps).toHaveLength(2);
  });
});

describe('useScrewProgress', () => {
  it('returns progress from a batch source', async () => {
    const { result } = renderHook(
      () => {
        const batch = useScrewBatch();
        const progress = useScrewProgress(batch);
        return { batch, progress };
      },
      { wrapper }
    );

    act(() => {
      result.current.batch.execute([
        { screwName: 'user', methodName: 'create', variables: { name: 'A' } }
      ]);
    });

    await waitFor(() => {
      expect(result.current.batch.isExecuting).toBe(false);
    });

    expect(result.current.progress?.percentage).toBe(100);
    expect(result.current.progress?.phase).toBe('completed');
    expect(result.current.progress?.itemsTotal).toBe(1);
  });
});
