import type { InfiniteQueryObserverOptions, UseInfiniteScrewQueryResult } from '../types';
export declare const useInfiniteScrewQuery: <TPageData = unknown, TPageParam = unknown>(screwName: string, methodName: string, options: InfiniteQueryObserverOptions<TPageData, TPageParam>) => UseInfiniteScrewQueryResult<TPageData, never, TPageParam>;
