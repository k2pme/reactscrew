import type { QueryKey, QueryMatchInput } from '../types';
export declare const DEFAULT_STALE_TIME = 0;
export declare const DEFAULT_CACHE_TIME: number;
export declare const serializeQueryKey: (queryKey: QueryKey) => string;
export declare const keyStartsWith: (queryKey: QueryKey, prefix: QueryKey) => boolean;
export declare const normalizeMatchInput: (input?: QueryMatchInput | QueryKey) => QueryMatchInput | undefined;
