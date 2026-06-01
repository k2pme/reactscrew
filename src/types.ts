import type { ReactNode } from 'react';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error' | 'stale';
export type MutationStatus = 'idle' | 'pending' | 'success' | 'error';

export type ScrewRoute<TArgs extends unknown[] = unknown[]> =
  | string
  | ((...args: TArgs) => string);

export type RuntimeValidator<TValue = unknown> = (value: TValue) => TValue | void;

export interface DocumentedErrorDefinition {
  status?: string;
  code: string;
  message?: string;
  description?: string;
  retryable?: boolean;
  uiHint?: string;
}

export interface QueryKeyContext<TArgs extends unknown[] = unknown[]> {
  screwName: string;
  methodName: string;
  args: TArgs;
}

export type QueryKey = readonly unknown[];
export type QueryKeyFactory<TArgs extends unknown[] = unknown[]> = (
  context: QueryKeyContext<TArgs>
) => QueryKey;

export interface BaseMethodDefinition<TArgs extends unknown[] = unknown[], TData = unknown> {
  route: ScrewRoute<TArgs>;
  httpMethod?: HttpMethod;
  headers?: Record<string, string>;
  paramsValidator?: RuntimeValidator<TArgs>;
  responseValidator?: RuntimeValidator<TData>;
  documentedErrors?: DocumentedErrorDefinition[];
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: ReactScrewErrorShape) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: ReactScrewErrorShape | null
  ) => void | Promise<void>;
}

export interface QueryDefinition<TArgs extends unknown[] = unknown[], TData = unknown>
  extends BaseMethodDefinition<TArgs, TData> {
  type?: 'query';
  queryKey?: QueryKeyFactory<TArgs>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export interface QueryInvalidationTarget<TArgs extends unknown[] = unknown[]> {
  screwName: string;
  methodName?: string;
  args?: TArgs;
}

export interface OptimisticUpdateContext<TVariables = unknown> {
  client: ReactScrewClientLike;
  variables: TVariables;
}

export interface MutationDefinition<TArgs extends unknown[] = unknown[], TData = unknown, TVariables = unknown>
  extends BaseMethodDefinition<TArgs, TData> {
  type?: 'mutation';
  bodyValidator?: RuntimeValidator<TVariables>;
  invalidateQueries?: QueryInvalidationTarget[];
  optimisticUpdate?: (
    context: OptimisticUpdateContext<TVariables>
  ) => Promise<RollbackAction | void> | RollbackAction | void;
}

export type ScrewMethodDefinition<TArgs extends unknown[] = unknown[], TData = unknown> =
  | QueryDefinition<TArgs, TData>
  | MutationDefinition<TArgs, TData>;

export interface ScrewDefinition {
  name: string;
  executeOnLaunch?: boolean;
  persistence?: boolean;
  methods: Record<string, ScrewMethodDefinition>;
}

export type ScrewsMap = Record<string, ScrewDefinition>;

export interface ApiRequestConfig {
  method: string;
  url: string;
  headers?: Record<string, string>;
  data?: unknown;
  signal?: AbortSignal;
}

export interface ApiResponse<TData = unknown> {
  data: TData;
  status: number;
  headers?: Record<string, unknown>;
}

export type ApiInstance = <TData = unknown>(
  config: ApiRequestConfig
) => Promise<ApiResponse<TData>>;

export interface ReactScrewErrorShape extends Error {
  code: string;
  status?: number;
  description?: string;
  details?: unknown;
  cause?: unknown;
  retryable?: boolean;
  uiHint?: string;
}

export interface QueryState<TData = unknown, TError = ReactScrewErrorShape> {
  status: QueryStatus;
  data: TData | null;
  error: TError | null;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  updatedAt: number | null;
  invalidatedAt: number | null;
  pageParams?: unknown[];
}

export interface MutationState<TData = unknown, TError = ReactScrewErrorShape> {
  status: MutationStatus;
  data: TData | null;
  error: TError | null;
  isPending: boolean;
}

export interface QueryObserverOptions<TArgs extends unknown[] = unknown[], TData = unknown> {
  args?: TArgs;
  enabled?: boolean;
  select?: (data: TData) => unknown;
  initialData?: TData;
  placeholderData?: TData;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  backend?: string;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: ReactScrewErrorShape) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: ReactScrewErrorShape | null
  ) => void | Promise<void>;
}

export interface UseScrewQueryResult<TData = unknown, TError = ReactScrewErrorShape>
  extends QueryState<TData, TError> {
  refetch: () => Promise<TData>;
  queryKey: QueryKey;
}

export interface MutationExecuteOptions<TVariables = unknown> {
  variables?: TVariables;
}

export interface UseScrewMutationOptions<TData = unknown, TVariables = unknown> {
  backend?: string;
  onSuccess?: (data: TData, variables: TVariables | undefined) => void | Promise<void>;
  onError?: (
    error: ReactScrewErrorShape,
    variables: TVariables | undefined
  ) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: ReactScrewErrorShape | null,
    variables: TVariables | undefined
  ) => void | Promise<void>;
  optimisticUpdate?: (
    context: OptimisticUpdateContext<TVariables>
  ) => Promise<RollbackAction | void> | RollbackAction | void;
}

export interface UseScrewMutationResult<
  TData = unknown,
  TVariables = unknown,
  TError = ReactScrewErrorShape
> extends MutationState<TData, TError> {
  mutate: (variables?: TVariables, ...args: unknown[]) => Promise<TData>;
  mutateAsync: (variables?: TVariables, ...args: unknown[]) => Promise<TData>;
  reset: () => void;
}

export interface LegacyUseScrewResult<
  TData = unknown,
  TError = ReactScrewErrorShape
> extends QueryState<TData, TError> {
  refetch: () => Promise<TData>;
  executeMethod: <TReturn = unknown>(methodName: string, ...args: unknown[]) => Promise<TReturn>;
}

export interface BackendConfig {
  apiInstance: ApiInstance;
  screws: ScrewsMap;
  clientOptions?: ReactScrewClientOptions;
  dehydratedState?: DehydratedState;
}

export interface DriverProviderProps {
  children: ReactNode;
  apiInstance?: ApiInstance;
  screws?: ScrewsMap;
  clientOptions?: ReactScrewClientOptions;
  dehydratedState?: DehydratedState;
  backends?: Record<string, BackendConfig>;
}

export interface ClientMetrics {
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  dedupedRequests: number;
  averageRequestDurationMs: number;
}

export interface RequestEvent {
  type:
    | 'query:start'
    | 'query:success'
    | 'query:error'
    | 'query:invalidate'
    | 'mutation:start'
    | 'mutation:success'
    | 'mutation:error';
  screwName: string;
  methodName: string;
  queryKey?: QueryKey;
  mutationKey?: string;
  status?: number;
  durationMs?: number;
  timestamp: number;
  error?: ReactScrewErrorShape | null;
  meta?: Record<string, unknown>;
}

export interface RequestObserver {
  onEvent?: (event: RequestEvent) => void;
}

export interface PersistedCacheConfig {
  version: string;
  namespace?: string;
}

export interface AuthStrategy {
  getAccessToken?: () => string | null | Promise<string | null>;
  refreshAccessToken?: () => Promise<string | null>;
  onAuthFailure?: (error: ReactScrewErrorShape) => void | Promise<void>;
  headerName?: string;
  headerPrefix?: string;
}

export interface ReactScrewClientOptions {
  persist?: PersistedCacheConfig;
  observer?: RequestObserver;
  tenantId?: string;
  auth?: AuthStrategy;
}

export interface QueryMatchInput {
  queryKey?: QueryKey;
  prefix?: QueryKey;
  screwName?: string;
  methodName?: string;
}

export interface QuerySnapshot<TData = unknown> {
  queryKey: QueryKey;
  state: QueryState<TData>;
}

export interface MutationSnapshot<TData = unknown> {
  mutationKey: string;
  state: MutationState<TData>;
}

export interface DehydratedQueryState {
  queryKey: QueryKey;
  screwName: string;
  methodName: string;
  args: unknown[];
  state: QueryState;
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

export interface DehydratedMutationState {
  mutationKey: string;
  state: MutationState;
}

export interface DehydratedState {
  queries: DehydratedQueryState[];
  mutations: DehydratedMutationState[];
  meta: {
    persistedAt: number;
    version?: string;
    tenantId?: string;
  };
}

export interface RollbackAction {
  rollback: () => void | Promise<void>;
}

export interface QueryStoreEntry<TData = unknown> {
  queryKey: QueryKey;
  keyHash: string;
  screwName: string;
  methodName: string;
  args: unknown[];
  state: QueryState<TData>;
  staleTime: number;
  cacheTime: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  observers: number;
  gcTimeoutId?: ReturnType<typeof setTimeout>;
  inFlight?: Promise<TData>;
  abortController?: AbortController;
  requestId: number;
  lastUpdatedDurationMs?: number;
}

export interface ReactScrewClientLike {
  getQueryData: <TData = unknown>(match: QueryMatchInput | QueryKey) => TData | null;
  setQueryData: <TData = unknown>(
    match: QueryMatchInput | QueryKey,
    updater: TData | ((current: TData | null) => TData)
  ) => void;
  patchQueryState: (
    match: QueryMatchInput | QueryKey,
    patch: Partial<QueryState>
  ) => void;
  invalidateQueries: (match?: QueryMatchInput | QueryKey) => Promise<void>;
}

export interface ScrewClientContextValue {
  client: ReactScrewClient;
  clients: ReadonlyMap<string, ReactScrewClient>;
  resolveClient: (screwName: string, backend?: string) => ReactScrewClient;
}

export interface ReactScrewClient extends ReactScrewClientLike {
  getQueryKey: (
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ) => QueryKey;
  hasMethod: (screwName: string, methodName: string) => boolean;
  subscribeQuery: (queryKey: QueryKey, listener: () => void) => () => void;
  registerQueryObserver: (
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ) => QueryStoreEntry;
  unregisterQueryObserver: (queryKey: QueryKey) => void;
  fetchQuery: <TData = unknown>(
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions,
    fetchOptions?: { force?: boolean }
  ) => Promise<TData>;
  prefetchQuery: <TData = unknown>(
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ) => Promise<TData>;
  executeMutation: <TData = unknown, TVariables = unknown>(
    screwName: string,
    methodName: string,
    variables?: TVariables,
    args?: unknown[],
    options?: UseScrewMutationOptions<TData, TVariables>
  ) => Promise<TData>;
  getQueryState: (queryKey: QueryKey) => QueryState;
  resetMutationState: (mutationKey: string) => void;
  getMutationState: (mutationKey: string) => MutationState;
  subscribeMutation: (mutationKey: string, listener: () => void) => () => void;
  getMetrics: () => ClientMetrics;
  getQuerySnapshots: () => QuerySnapshot[];
  getMutationSnapshots: () => MutationSnapshot[];
  getEvents: () => RequestEvent[];
  subscribeEvents: (listener: (event: RequestEvent) => void) => () => void;
  dehydrate: () => DehydratedState;
  hydrate: (state: DehydratedState) => void;
  persistCache: () => Promise<void>;
  restorePersistedCache: () => Promise<void>;
  handleWindowFocus: () => Promise<void>;
  handleReconnect: () => Promise<void>;
  executeLegacyMethod: <TReturn = unknown>(
    screwName: string,
    methodName: string,
    ...args: unknown[]
  ) => Promise<TReturn>;
}

export interface InfiniteQueryObserverOptions<
  TPageData = unknown,
  TPageParam = unknown
> extends QueryObserverOptions<unknown[], TPageData[]> {
  initialPageParam: TPageParam;
  getNextPageParam: (
    lastPage: TPageData,
    allPages: TPageData[],
    lastPageParam: TPageParam
  ) => TPageParam | undefined;
}

export interface UseInfiniteScrewQueryResult<
  TPageData = unknown,
  TError = ReactScrewErrorShape,
  TPageParam = unknown
> extends UseScrewQueryResult<TPageData[], TError> {
  fetchNextPage: () => Promise<TPageData[]>;
  hasNextPage: boolean;
  pageParams: TPageParam[];
}
