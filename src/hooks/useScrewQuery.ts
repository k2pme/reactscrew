'use client';

import { useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { ReactScrewError } from '../errors';
import { DriverContext } from '../components/DriverProvider';
import type { QueryObserverOptions, QueryState, UseScrewQueryResult } from '../types';

export const useScrewQuery = <TData = unknown>(
  screwName: string,
  methodName: string,
  options?: QueryObserverOptions<unknown[], TData>
): UseScrewQueryResult<TData> => {
  const context = useContext(DriverContext);

  if (!context) {
    throw new ReactScrewError('useScrewQuery must be used inside DriverProvider.', {
      code: 'MISSING_DRIVER_PROVIDER'
    });
  }

  const queryKey = useMemo(
    () => context.client.getQueryKey(screwName, methodName, options as QueryObserverOptions),
    [context.client, methodName, options, screwName]
  );

  useEffect(() => {
    context.client.registerQueryObserver(
      screwName,
      methodName,
      options as QueryObserverOptions
    );
    return () => {
      context.client.unregisterQueryObserver(queryKey);
    };
  }, [context.client, methodName, options, queryKey, screwName]);

  const state = useSyncExternalStore<QueryState<TData>>(
    (listener) => context.client.subscribeQuery(queryKey, listener),
    () => context.client.getQueryState(queryKey) as QueryState<TData>,
    () => context.client.getQueryState(queryKey) as QueryState<TData>
  );

  useEffect(() => {
    const isEnabled = options?.enabled ?? true;
    const hasData = state.data !== null || options?.initialData !== undefined;
    if (!isEnabled) {
      return;
    }

    const shouldFetch =
      !state.isFetching &&
      (state.status === 'idle' || (!hasData && state.status !== 'success') || state.invalidatedAt !== null);

    if (shouldFetch) {
      void context.client
        .fetchQuery<TData>(screwName, methodName, options as QueryObserverOptions, {
          force: state.invalidatedAt !== null
        })
        .catch(() => undefined);
    }
  }, [
    context.client,
    methodName,
    options,
    screwName,
    state.data,
    state.invalidatedAt,
    state.isFetching,
    state.status
  ]);

  const selectedData =
    state.data !== null && options?.select ? (options.select(state.data) as TData) : state.data;
  const data =
    selectedData ?? options?.placeholderData ?? options?.initialData ?? null;

  return {
    ...state,
    data,
    refetch: () =>
      context.client.fetchQuery<TData>(
        screwName,
        methodName,
        options as QueryObserverOptions,
        { force: true }
      ),
    queryKey
  };
};
