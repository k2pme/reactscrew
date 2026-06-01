'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useScrewClient } from './useScrewClient';
import type { LegacyUseScrewResult, QueryState } from '../types';

const IDLE_STATE: QueryState = {
  status: 'idle',
  data: null,
  error: null,
  isLoading: false,
  isFetching: false,
  isRefetching: false,
  updatedAt: null,
  invalidatedAt: null
};

export const useScrew = <TData = unknown>(screwName: string): LegacyUseScrewResult<TData> => {
  const client = useScrewClient();
  const hasInit = client.hasMethod(screwName, 'init');
  const queryKey = hasInit ? client.getQueryKey(screwName, 'init') : [screwName, 'init'];
  const queryState = useSyncExternalStore<QueryState<TData>>(
    (listener) => (hasInit ? client.subscribeQuery(queryKey, listener) : () => undefined),
    () =>
      hasInit
        ? (client.getQueryState(queryKey) as QueryState<TData>)
        : (IDLE_STATE as QueryState<TData>),
    () =>
      hasInit
        ? (client.getQueryState(queryKey) as QueryState<TData>)
        : (IDLE_STATE as QueryState<TData>)
  );

  useEffect(() => {
    if (!hasInit || queryState.isFetching || queryState.status !== 'idle') {
      return;
    }

    void client.fetchQuery<TData>(screwName, 'init').catch(() => undefined);
  }, [client, hasInit, queryState.isFetching, queryState.status, screwName]);

  return {
    ...queryState,
    executeMethod: async <TReturn = unknown>(methodName: string, ...args: unknown[]) => {
      if (methodName === 'init' && hasInit) {
        return client.fetchQuery<TReturn>(screwName, 'init', { args }) as Promise<TReturn>;
      }

      return client.executeLegacyMethod<TReturn>(screwName, methodName, ...args);
    },
    refetch: () =>
      hasInit
        ? client.fetchQuery<TData>(screwName, 'init', undefined, { force: true })
        : Promise.resolve(null as TData)
  };
};
