import { useEffect, useSyncExternalStore } from 'react';
import { useScrewClient } from './useScrewClient';
import type {
  InfiniteQueryObserverOptions,
  QueryState,
  UseInfiniteScrewQueryResult
} from '../types';

export const useInfiniteScrewQuery = <
  TPageData = unknown,
  TPageParam = unknown
>(
  screwName: string,
  methodName: string,
  options: InfiniteQueryObserverOptions<TPageData, TPageParam>
): UseInfiniteScrewQueryResult<TPageData, never, TPageParam> => {
  const client = useScrewClient();
  const queryKey = client.getQueryKey(screwName, methodName, {
    initialData: [],
    staleTime: options.staleTime,
    cacheTime: options.cacheTime,
    refetchOnReconnect: options.refetchOnReconnect,
    refetchOnWindowFocus: options.refetchOnWindowFocus
  });

  useEffect(() => {
    client.registerQueryObserver(screwName, methodName, {
      initialData: [],
      staleTime: options.staleTime,
      cacheTime: options.cacheTime,
      refetchOnReconnect: options.refetchOnReconnect,
      refetchOnWindowFocus: options.refetchOnWindowFocus
    });

    return () => {
      client.unregisterQueryObserver(queryKey);
    };
  }, [
    client,
    methodName,
    options.cacheTime,
    options.refetchOnReconnect,
    options.refetchOnWindowFocus,
    options.staleTime,
    queryKey,
    screwName
  ]);

  const state = useSyncExternalStore<QueryState<TPageData[]>>(
    (listener) => client.subscribeQuery(queryKey, listener),
    () => client.getQueryState(queryKey) as QueryState<TPageData[]>,
    () => client.getQueryState(queryKey) as QueryState<TPageData[]>
  );

  const pages = state.data ?? [];
  const pageParams = (state.pageParams as TPageParam[] | undefined) ?? [options.initialPageParam];
  const lastPage = pages[pages.length - 1];
  const lastPageParam = pageParams[pageParams.length - 1] ?? options.initialPageParam;
  const nextPageParam =
    lastPage !== undefined
      ? options.getNextPageParam(lastPage, pages, lastPageParam)
      : options.initialPageParam;

  useEffect(() => {
    if (pages.length > 0 || state.isFetching) {
      return;
    }

    void (async () => {
      const firstPage = await client.fetchQuery<TPageData>(screwName, methodName, {
        ...options,
        args: [options.initialPageParam]
      } as never);
      client.setQueryData<TPageData[]>(queryKey, [firstPage]);
      client.patchQueryState(queryKey, { pageParams: [options.initialPageParam] });
    })();
  }, [client, methodName, options, pages.length, queryKey, screwName, state.isFetching]);

  return {
    ...state,
    data: pages,
    error: state.error as never,
    hasNextPage: nextPageParam !== undefined,
    pageParams,
    queryKey,
    refetch: async () => {
      const firstPage = await client.fetchQuery<TPageData>(screwName, methodName, {
        ...options,
        args: [options.initialPageParam]
      } as never);
      client.setQueryData<TPageData[]>(queryKey, [firstPage]);
      client.patchQueryState(queryKey, { pageParams: [options.initialPageParam] });
      return [firstPage];
    },
    fetchNextPage: async () => {
      if (nextPageParam === undefined) {
        return pages;
      }

      const nextPage = await client.fetchQuery<TPageData>(screwName, methodName, {
        ...options,
        args: [nextPageParam]
      } as never);
      const nextPages = [...pages, nextPage];
      client.setQueryData<TPageData[]>(queryKey, nextPages);
      client.patchQueryState(queryKey, {
        pageParams: [...pageParams, nextPageParam]
      });
      return nextPages;
    }
  };
};
