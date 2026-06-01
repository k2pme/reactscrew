import type { QueryObserverOptions, UseScrewQueryResult } from '../types';
export declare const useScrewQuery: <TData = unknown>(screwName: string, methodName: string, options?: QueryObserverOptions<unknown[], TData>) => UseScrewQueryResult<TData>;
