'use client';

import localforage from 'localforage';
import { normalizeError, ReactScrewError } from '../errors';
import type {
  ClientMetrics,
  DehydratedState,
  MutationDefinition,
  MutationSnapshot,
  MutationState,
  QueryDefinition,
  QueryInvalidationTarget,
  QueryKey,
  QueryMatchInput,
  QueryObserverOptions,
  QuerySnapshot,
  QueryState,
  QueryStoreEntry,
  ReactScrewClient,
  ReactScrewClientOptions,
  RequestEvent,
  ScrewsMap,
  ScrewMethodDefinition,
  UseScrewMutationOptions,
  ApiInstance
} from '../types';
import { logRequest } from '../utils/logger';
import {
  DEFAULT_CACHE_TIME,
  DEFAULT_STALE_TIME,
  keyStartsWith,
  normalizeMatchInput,
  serializeQueryKey
} from '../utils/queryKey';
import { runValidator } from '../utils/validators';

const WRITE_METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH']);

const createQueryState = <TData>(overrides?: Partial<QueryState<TData>>): QueryState<TData> => ({
  status: 'idle',
  data: null,
  error: null,
  isLoading: false,
  isFetching: false,
  isRefetching: false,
  updatedAt: null,
  invalidatedAt: null,
  ...overrides
});

const createMutationState = <TData>(overrides?: Partial<MutationState<TData>>): MutationState<TData> => ({
  status: 'idle',
  data: null,
  error: null,
  isPending: false,
  ...overrides
});

const idleQueryState = createQueryState();
const idleMutationState = createMutationState();
const DEFAULT_PERSIST_NAMESPACE = 'reactscrew-cache';

const inferMethodType = (method: ScrewMethodDefinition): 'query' | 'mutation' => {
  if (method.type) {
    return method.type;
  }

  const httpMethod = (method.httpMethod ?? 'GET').toUpperCase();
  return httpMethod === 'GET' ? 'query' : 'mutation';
};

const isQueryDefinition = (method: ScrewMethodDefinition): method is QueryDefinition =>
  inferMethodType(method) === 'query';

const defaultQueryKey = (screwName: string, methodName: string, args: unknown[]): QueryKey => [
  screwName,
  methodName,
  ...args
];

const shouldUseBody = (method: string): boolean => WRITE_METHODS_WITH_BODY.has(method.toUpperCase());

const resolveRouteArgs = (httpMethod: string, args: unknown[]): unknown[] =>
  shouldUseBody(httpMethod) ? args.slice(0, -1) : args;

const resolveBody = (httpMethod: string, args: unknown[]): unknown =>
  shouldUseBody(httpMethod) && args.length > 0 ? args[args.length - 1] : undefined;

const resolveRoute = (
  definition: Pick<ScrewMethodDefinition, 'route' | 'httpMethod'>,
  args: unknown[]
): string => {
  const httpMethod = definition.httpMethod ?? 'GET';
  const routeArgs = resolveRouteArgs(httpMethod, args);
  return typeof definition.route === 'function' ? definition.route(...routeArgs) : definition.route;
};

const mergeInvalidationTarget = (target: QueryInvalidationTarget): QueryMatchInput => ({
  screwName: target.screwName,
  methodName: target.methodName,
  queryKey:
    target.args && target.methodName
      ? [target.screwName, target.methodName, ...target.args]
      : undefined
});

export class DefaultReactScrewClient implements ReactScrewClient {
  private readonly apiInstance: ApiInstance;
  private readonly screws: ScrewsMap;
  private readonly options?: ReactScrewClientOptions;
  private readonly queryEntries = new Map<string, QueryStoreEntry>();
  private readonly queryListeners = new Map<string, Set<() => void>>();
  private readonly mutationStates = new Map<string, MutationState>();
  private readonly mutationListeners = new Map<string, Set<() => void>>();
  private readonly eventListeners = new Set<(event: RequestEvent) => void>();
  private readonly eventLog: RequestEvent[] = [];
  private readonly metrics: ClientMetrics = {
    cacheHits: 0,
    cacheMisses: 0,
    networkRequests: 0,
    dedupedRequests: 0,
    averageRequestDurationMs: 0
  };
  private totalRequestDurationMs = 0;

  constructor(apiInstance: ApiInstance, screws: ScrewsMap, options?: ReactScrewClientOptions) {
    this.apiInstance = apiInstance;
    this.screws = screws;
    this.options = options;
  }

  subscribeQuery = (queryKey: QueryKey, listener: () => void): (() => void) => {
    const keyHash = serializeQueryKey(queryKey);
    const listeners = this.queryListeners.get(keyHash) ?? new Set<() => void>();
    listeners.add(listener);
    this.queryListeners.set(keyHash, listeners);

    return () => {
      const current = this.queryListeners.get(keyHash);
      if (!current) {
        return;
      }

      current.delete(listener);
      if (current.size === 0) {
        this.queryListeners.delete(keyHash);
      }
    };
  };

  getQueryKey = (
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ): QueryKey => {
    const definition = this.getMethodDefinition<QueryDefinition>(screwName, methodName, 'query');
    const args = (options?.args ?? []) as unknown[];
    return (
      definition.queryKey?.({
        screwName,
        methodName,
        args
      }) ?? defaultQueryKey(screwName, methodName, args)
    );
  };

  hasMethod = (screwName: string, methodName: string): boolean =>
    Boolean(this.screws[screwName]?.methods[methodName]);

  subscribeMutation = (mutationKey: string, listener: () => void): (() => void) => {
    const listeners = this.mutationListeners.get(mutationKey) ?? new Set<() => void>();
    listeners.add(listener);
    this.mutationListeners.set(mutationKey, listeners);

    return () => {
      const current = this.mutationListeners.get(mutationKey);
      if (!current) {
        return;
      }

      current.delete(listener);
      if (current.size === 0) {
        this.mutationListeners.delete(mutationKey);
      }
    };
  };

  subscribeEvents = (listener: (event: RequestEvent) => void): (() => void) => {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  };

  registerQueryObserver = (
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ): QueryStoreEntry => {
    const entry = this.ensureQueryEntry(screwName, methodName, options);
    entry.observers += 1;

    if (entry.gcTimeoutId) {
      clearTimeout(entry.gcTimeoutId);
      entry.gcTimeoutId = undefined;
    }

    return entry;
  };

  unregisterQueryObserver = (queryKey: QueryKey): void => {
    const keyHash = serializeQueryKey(queryKey);
    const entry = this.queryEntries.get(keyHash);

    if (!entry) {
      return;
    }

    entry.observers = Math.max(0, entry.observers - 1);

    if (entry.observers === 0) {
      entry.gcTimeoutId = setTimeout(() => {
        const current = this.queryEntries.get(keyHash);
        if (current && current.observers === 0) {
          current.abortController?.abort();
          this.queryEntries.delete(keyHash);
          this.queryListeners.delete(keyHash);
        }
      }, entry.cacheTime);
      if (typeof (entry.gcTimeoutId as { unref?: () => void }).unref === 'function') {
        (entry.gcTimeoutId as { unref: () => void }).unref();
      }
    }
  };

  getQueryState = (queryKey: QueryKey): QueryState => {
    const keyHash = serializeQueryKey(queryKey);
    return this.queryEntries.get(keyHash)?.state ?? idleQueryState;
  };

  getMutationState = (mutationKey: string): MutationState => {
    return this.mutationStates.get(mutationKey) ?? idleMutationState;
  };

  resetMutationState = (mutationKey: string): void => {
    this.mutationStates.set(mutationKey, createMutationState());
    this.notifyMutation(mutationKey);
  };

  fetchQuery = async <TData = unknown>(
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions,
    fetchOptions?: { force?: boolean }
  ): Promise<TData> => {
    const entry = this.ensureQueryEntry<TData>(screwName, methodName, options);
    const definition = this.getMethodDefinition<QueryDefinition<unknown[], TData>>(
      screwName,
      methodName,
      'query'
    );

    if (entry.inFlight && !fetchOptions?.force) {
      this.metrics.dedupedRequests += 1;
      return entry.inFlight;
    }

    if (entry.abortController && fetchOptions?.force) {
      entry.abortController.abort();
    }

    const requestId = entry.requestId + 1;
    const isFirstLoad = entry.state.updatedAt === null && entry.state.data === null;
    const abortController = new AbortController();

    entry.requestId = requestId;
    entry.abortController = abortController;
    entry.state = {
      ...entry.state,
      status: isFirstLoad ? 'loading' : entry.state.status,
      isLoading: isFirstLoad,
      isFetching: true,
      isRefetching: !isFirstLoad,
      error: null
    };
    this.notifyQuery(entry.queryKey);
    this.emitEvent({
      type: 'query:start',
      screwName,
      methodName,
      queryKey: entry.queryKey,
      timestamp: Date.now()
    });

    this.metrics.cacheMisses += 1;
    this.metrics.networkRequests += 1;

    const args = (options?.args ?? entry.args) as unknown[];
    const startedAt = Date.now();
    const requestPromise: Promise<TData> = Promise.resolve()
      .then(async () => {
        const validatedArgs = runValidator(
          definition.paramsValidator as ((value: unknown[]) => unknown[] | void) | undefined,
          args,
          'QUERY_PARAMS_VALIDATION_FAILED',
          `Query params validation failed for ${screwName}.${methodName}.`
        );
        const route = resolveRoute(definition, validatedArgs);
        const response = await this.apiInstance<TData>({
          method: definition.httpMethod ?? 'GET',
          url: route,
          headers: definition.headers,
          signal: abortController.signal
        });

        return { response, route };
      })
      .then(async (response) => {
        const latestEntry = this.queryEntries.get(entry.keyHash);
        if (!latestEntry || latestEntry.requestId !== requestId) {
          return latestEntry?.state.data as TData;
        }

        const validatedResponse = runValidator(
          definition.responseValidator as ((value: TData) => TData | void) | undefined,
          response.response.data,
          'QUERY_RESPONSE_VALIDATION_FAILED',
          `Query response validation failed for ${screwName}.${methodName}.`
        );

        const durationMs = Date.now() - startedAt;
        latestEntry.lastUpdatedDurationMs = durationMs;
        this.recordRequestDuration(durationMs);
        latestEntry.inFlight = undefined;
        latestEntry.abortController = undefined;
        latestEntry.state = {
          status: 'success',
          data: validatedResponse,
          error: null,
          isLoading: false,
          isFetching: false,
          isRefetching: false,
          updatedAt: Date.now(),
          invalidatedAt: null
        };

        logRequest(
          definition.httpMethod ?? 'GET',
          response.route,
          response.response.status,
          response.response.headers,
          undefined,
          validatedResponse,
          durationMs
        );

        if (this.screws[screwName].persistence) {
          await localforage?.setItem(this.getPersistenceKey(entry.queryKey), validatedResponse);
        }

        await definition.onSuccess?.(validatedResponse);
        await definition.onSettled?.(validatedResponse, null);
        await options?.onSuccess?.(validatedResponse);
        await options?.onSettled?.(validatedResponse, null);
        this.notifyQuery(entry.queryKey);
        this.emitEvent({
          type: 'query:success',
          screwName,
          methodName,
          queryKey: entry.queryKey,
          status: response.response.status,
          durationMs,
          timestamp: Date.now()
        });
        return validatedResponse;
      })
      .catch(async (error): Promise<TData> => {
        if ((error as Error).name === 'AbortError') {
          throw error;
        }

        const latestEntry = this.queryEntries.get(entry.keyHash);
        const normalized = normalizeError(
          error,
          `Query failed for ${screwName}.${methodName}.`,
          definition.documentedErrors
        );

        if (!latestEntry || latestEntry.requestId !== requestId) {
          throw normalized;
        }

        latestEntry.inFlight = undefined;
        latestEntry.abortController = undefined;

        if (this.screws[screwName].persistence) {
          const cachedData = await localforage?.getItem<TData>(this.getPersistenceKey(entry.queryKey));
          if (cachedData !== null && cachedData !== undefined) {
            latestEntry.state = {
              status: 'success',
              data: cachedData,
              error: null,
              isLoading: false,
              isFetching: false,
              isRefetching: false,
              updatedAt: Date.now(),
              invalidatedAt: null
            };
            this.notifyQuery(entry.queryKey);
            return cachedData as TData;
          }
        }

        latestEntry.state = {
          ...latestEntry.state,
          status: 'error',
          error: normalized,
          isLoading: false,
          isFetching: false,
          isRefetching: false
        };

        await definition.onError?.(normalized);
        await definition.onSettled?.(undefined, normalized);
        await options?.onError?.(normalized);
        await options?.onSettled?.(undefined, normalized);
        this.notifyQuery(entry.queryKey);
        this.emitEvent({
          type: 'query:error',
          screwName,
          methodName,
          queryKey: entry.queryKey,
          error: normalized,
          timestamp: Date.now()
        });
        throw normalized;
      });

    entry.inFlight = requestPromise;
    return requestPromise as Promise<TData>;
  };

  prefetchQuery = async <TData = unknown>(
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ): Promise<TData> => {
    return this.fetchQuery<TData>(screwName, methodName, options);
  };

  executeMutation = async <TData = unknown, TVariables = unknown>(
    screwName: string,
    methodName: string,
    variables?: TVariables,
    args: unknown[] = [],
    options?: UseScrewMutationOptions<TData, TVariables>
  ): Promise<TData> => {
    const definition = this.getMethodDefinition<MutationDefinition>(
      screwName,
      methodName,
      'mutation'
    ) as MutationDefinition<unknown[], TData, TVariables>;
    const mutationKey = this.getMutationKey(screwName, methodName);
    const mutationState = createMutationState<TData>({
      status: 'pending',
      data: null,
      error: null,
      isPending: true
    });

    this.mutationStates.set(mutationKey, mutationState);
    this.notifyMutation(mutationKey);
    this.emitEvent({
      type: 'mutation:start',
      screwName,
      methodName,
      mutationKey,
      timestamp: Date.now()
    });

    const validatedVariables = runValidator(
      definition.bodyValidator as ((value: TVariables | undefined) => TVariables | void) | undefined,
      variables as TVariables | undefined,
      'MUTATION_BODY_VALIDATION_FAILED',
      `Mutation body validation failed for ${screwName}.${methodName}.`
    );
    const validatedArgs = runValidator(
      definition.paramsValidator,
      args,
      'MUTATION_PARAMS_VALIDATION_FAILED',
      `Mutation params validation failed for ${screwName}.${methodName}.`
    );

    const optimisticRollback =
      (await options?.optimisticUpdate?.({
        client: this,
        variables: validatedVariables as TVariables
      })) ??
      (await definition.optimisticUpdate?.({
        client: this,
        variables: validatedVariables as TVariables
      }));

      const routeArgs =
        validatedVariables === undefined
          ? validatedArgs
          : [...validatedArgs, validatedVariables];
    const route = resolveRoute(definition, routeArgs);
    const requestData = validatedVariables;
    const startedAt = Date.now();

    try {
      this.metrics.networkRequests += 1;
      const response = await this.apiInstance<TData>({
        method: definition.httpMethod ?? 'POST',
        url: route,
        headers: definition.headers,
        data: requestData
      });

      const validatedResponse = runValidator(
        definition.responseValidator,
        response.data,
        'MUTATION_RESPONSE_VALIDATION_FAILED',
        `Mutation response validation failed for ${screwName}.${methodName}.`
      );

      this.mutationStates.set(
        mutationKey,
        createMutationState({
          status: 'success',
          data: validatedResponse,
          error: null,
          isPending: false
        })
      );
      this.notifyMutation(mutationKey);
      this.recordRequestDuration(Date.now() - startedAt);

      logRequest(
        definition.httpMethod ?? 'POST',
        route,
        response.status,
        response.headers,
        requestData,
        validatedResponse,
        Date.now() - startedAt
      );

      await this.invalidateTargets(definition.invalidateQueries);
      await definition.onSuccess?.(validatedResponse);
      await definition.onSettled?.(validatedResponse, null);
      await options?.onSuccess?.(validatedResponse, validatedVariables as TVariables | undefined);
      await options?.onSettled?.(
        validatedResponse,
        null,
        validatedVariables as TVariables | undefined
      );
      this.emitEvent({
        type: 'mutation:success',
        screwName,
        methodName,
        mutationKey,
        status: response.status,
        durationMs: Date.now() - startedAt,
        timestamp: Date.now()
      });
      return validatedResponse as TData;
    } catch (error) {
      const normalized = normalizeError(
        error,
        `Mutation failed for ${screwName}.${methodName}.`,
        definition.documentedErrors
      );

      if (optimisticRollback) {
        await optimisticRollback.rollback();
      }

      this.mutationStates.set(
        mutationKey,
        createMutationState({
          status: 'error',
          data: null,
          error: normalized,
          isPending: false
        })
      );
      this.notifyMutation(mutationKey);
      await definition.onError?.(normalized);
      await definition.onSettled?.(undefined, normalized);
      await options?.onError?.(normalized, validatedVariables as TVariables | undefined);
      await options?.onSettled?.(
        undefined,
        normalized,
        validatedVariables as TVariables | undefined
      );
      this.emitEvent({
        type: 'mutation:error',
        screwName,
        methodName,
        mutationKey,
        error: normalized,
        timestamp: Date.now()
      });
      throw normalized;
    }
  };

  getQueryData = <TData = unknown>(match: QueryMatchInput | QueryKey): TData | null => {
    const entry = this.findFirstMatch(match);
    if (!entry) {
      return null;
    }

    this.metrics.cacheHits += 1;
    return (entry.state.data as TData | null) ?? null;
  };

  setQueryData = <TData = unknown>(
    match: QueryMatchInput | QueryKey,
    updater: TData | ((current: TData | null) => TData)
  ): void => {
    const entry = this.findFirstMatch(match);
    if (!entry) {
      const normalized = normalizeMatchInput(match);
      if (normalized?.queryKey) {
        const keyHash = serializeQueryKey(normalized.queryKey);
        const created = this.createDetachedEntry(normalized.queryKey);
        this.queryEntries.set(keyHash, created);
        created.state = {
          ...created.state,
          status: 'success',
              data:
                typeof updater === 'function'
                  ? (updater as (current: TData | null) => TData)(null)
                  : updater,
          updatedAt: Date.now()
        };
        this.notifyQuery(created.queryKey);
      }
      return;
    }

    const nextData =
      typeof updater === 'function'
        ? (updater as (current: TData | null) => TData)(entry.state.data as TData | null)
        : updater;

    entry.state = {
      ...entry.state,
      status: 'success',
      data: nextData,
      error: null,
      updatedAt: Date.now(),
      invalidatedAt: null
    };
    this.notifyQuery(entry.queryKey);
  };

  patchQueryState = (match: QueryMatchInput | QueryKey, patch: Partial<QueryState>): void => {
    const entry = this.findFirstMatch(match);
    if (!entry) {
      return;
    }

    entry.state = {
      ...entry.state,
      ...patch
    };
    this.notifyQuery(entry.queryKey);
  };

  invalidateQueries = async (match?: QueryMatchInput | QueryKey): Promise<void> => {
    const entries = this.findMatchingEntries(match);
    await Promise.all(
      entries.map(async (entry) => {
        entry.state = {
          ...entry.state,
          status: 'stale',
          invalidatedAt: Date.now()
        };
        this.notifyQuery(entry.queryKey);
        this.emitEvent({
          type: 'query:invalidate',
          screwName: entry.screwName,
          methodName: entry.methodName,
          queryKey: entry.queryKey,
          timestamp: Date.now()
        });
        if (entry.observers > 0) {
          await this.fetchQuery(entry.screwName, entry.methodName, {
            args: entry.args,
            staleTime: entry.staleTime,
            cacheTime: entry.cacheTime,
            refetchOnReconnect: entry.refetchOnReconnect,
            refetchOnWindowFocus: entry.refetchOnWindowFocus
          }, { force: true });
        }
      })
    );
  };

  handleWindowFocus = async (): Promise<void> => {
    await this.refetchMatching((entry) => entry.observers > 0 && entry.refetchOnWindowFocus);
  };

  handleReconnect = async (): Promise<void> => {
    await this.refetchMatching((entry) => entry.observers > 0 && entry.refetchOnReconnect);
  };

  getMetrics = (): ClientMetrics => ({ ...this.metrics });

  getQuerySnapshots = (): QuerySnapshot[] =>
    [...this.queryEntries.values()].map((entry) => ({
      queryKey: entry.queryKey,
      state: { ...entry.state }
    }));

  getMutationSnapshots = (): MutationSnapshot[] =>
    [...this.mutationStates.entries()].map(([mutationKey, state]) => ({
      mutationKey,
      state: { ...state }
    }));

  getEvents = (): RequestEvent[] => [...this.eventLog];

  dehydrate = (): DehydratedState => ({
    queries: [...this.queryEntries.values()].map((entry) => ({
      queryKey: entry.queryKey,
      screwName: entry.screwName,
      methodName: entry.methodName,
      args: entry.args,
      state: { ...entry.state },
      staleTime: entry.staleTime,
      cacheTime: entry.cacheTime,
      refetchOnWindowFocus: entry.refetchOnWindowFocus,
      refetchOnReconnect: entry.refetchOnReconnect
    })),
    mutations: [...this.mutationStates.entries()].map(([mutationKey, state]) => ({
      mutationKey,
      state: { ...state }
    })),
    meta: {
      persistedAt: Date.now(),
      version: this.options?.persist?.version,
      tenantId: this.options?.tenantId
    }
  });

  hydrate = (state: DehydratedState): void => {
    const version = this.options?.persist?.version;
    if (version && state.meta.version && version !== state.meta.version) {
      return;
    }

    state.queries.forEach((query) => {
      const keyHash = serializeQueryKey(query.queryKey);
      this.queryEntries.set(keyHash, {
        queryKey: query.queryKey,
        keyHash,
        screwName: query.screwName,
        methodName: query.methodName,
        args: query.args,
        state: { ...query.state },
        staleTime: query.staleTime,
        cacheTime: query.cacheTime,
        refetchOnWindowFocus: query.refetchOnWindowFocus,
        refetchOnReconnect: query.refetchOnReconnect,
        observers: 0,
        requestId: 0
      });
      this.notifyQuery(query.queryKey);
    });

    state.mutations.forEach((mutation) => {
      this.mutationStates.set(mutation.mutationKey, { ...mutation.state });
      this.notifyMutation(mutation.mutationKey);
    });
  };

  persistCache = async (): Promise<void> => {
    if (!this.options?.persist) {
      return;
    }

    await localforage?.setItem(this.getPersistStoreKey(), this.dehydrate());
  };

  restorePersistedCache = async (): Promise<void> => {
    if (!this.options?.persist) {
      return;
    }

    const state = await localforage?.getItem<DehydratedState>(this.getPersistStoreKey());
    if (state) {
      this.hydrate(state);
    }
  };

  executeLegacyMethod = async <TReturn = unknown>(
    screwName: string,
    methodName: string,
    ...args: unknown[]
  ): Promise<TReturn> => {
    const definition = this.getMethodDefinition<ScrewMethodDefinition>(screwName, methodName);

    if (isQueryDefinition(definition)) {
      return this.fetchQuery<TReturn>(screwName, methodName, { args }) as Promise<TReturn>;
    }

    const variables = resolveBody(definition.httpMethod ?? 'POST', args);
    const routeArgs = resolveRouteArgs(definition.httpMethod ?? 'POST', args);
    return this.executeMutation<TReturn, unknown>(screwName, methodName, variables, routeArgs);
  };

  private ensureQueryEntry = <TData = unknown>(
    screwName: string,
    methodName: string,
    options?: QueryObserverOptions
  ): QueryStoreEntry<TData> => {
    const definition = this.getMethodDefinition<QueryDefinition>(screwName, methodName, 'query');
    const args = (options?.args ?? []) as unknown[];
    const queryKey = this.getQueryKey(screwName, methodName, options);
    const keyHash = serializeQueryKey(queryKey);
    const existing = this.queryEntries.get(keyHash) as QueryStoreEntry<TData> | undefined;

    if (existing) {
      existing.args = args;
      existing.staleTime = options?.staleTime ?? definition.staleTime ?? existing.staleTime;
      existing.cacheTime = options?.cacheTime ?? definition.cacheTime ?? existing.cacheTime;
      existing.refetchOnReconnect =
        options?.refetchOnReconnect ?? definition.refetchOnReconnect ?? existing.refetchOnReconnect;
      existing.refetchOnWindowFocus =
        options?.refetchOnWindowFocus ??
        definition.refetchOnWindowFocus ??
        existing.refetchOnWindowFocus;
      return existing;
    }

    const initialData = (options?.initialData ?? options?.placeholderData) as TData | undefined;
    const entry: QueryStoreEntry<TData> = {
      queryKey,
      keyHash,
      screwName,
      methodName,
      args,
      state: createQueryState<TData>(
        initialData !== undefined
          ? {
              status: 'success',
              data: initialData,
              updatedAt: Date.now()
            }
          : undefined
      ),
      staleTime: options?.staleTime ?? definition.staleTime ?? DEFAULT_STALE_TIME,
      cacheTime: options?.cacheTime ?? definition.cacheTime ?? DEFAULT_CACHE_TIME,
      refetchOnWindowFocus: options?.refetchOnWindowFocus ?? definition.refetchOnWindowFocus ?? true,
      refetchOnReconnect: options?.refetchOnReconnect ?? definition.refetchOnReconnect ?? true,
      observers: 0,
      requestId: 0
    };

    this.queryEntries.set(keyHash, entry);
    return entry;
  };

  private createDetachedEntry = (queryKey: QueryKey): QueryStoreEntry => ({
    queryKey,
    keyHash: serializeQueryKey(queryKey),
    screwName: String(queryKey[0] ?? 'detached'),
    methodName: String(queryKey[1] ?? 'detached'),
    args: queryKey.slice(2),
    state: createQueryState(),
    staleTime: DEFAULT_STALE_TIME,
    cacheTime: DEFAULT_CACHE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    observers: 0,
    requestId: 0
  });

  private getMethodDefinition<T>(
    screwName: string,
    methodName: string,
    expectedType?: 'query' | 'mutation'
  ): T {
    const screw = this.screws[screwName];
    const definition = screw?.methods[methodName];

    if (!screw || !definition) {
      throw new ReactScrewError(`Method "${methodName}" is not defined for screw "${screwName}".`, {
        code: 'SCREW_METHOD_NOT_FOUND'
      });
    }

    if (expectedType && inferMethodType(definition) !== expectedType) {
      throw new ReactScrewError(
        `Method "${methodName}" on screw "${screwName}" is not a ${expectedType}.`,
        { code: 'INVALID_METHOD_TYPE' }
      );
    }

    return definition as T;
  }

  private notifyQuery(queryKey: QueryKey): void {
    const keyHash = serializeQueryKey(queryKey);
    this.queryListeners.get(keyHash)?.forEach((listener) => listener());
  }

  private notifyMutation(mutationKey: string): void {
    this.mutationListeners.get(mutationKey)?.forEach((listener) => listener());
  }

  private emitEvent(event: RequestEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > 200) {
      this.eventLog.shift();
    }
    this.options?.observer?.onEvent?.(event);
    this.eventListeners.forEach((listener) => listener(event));
  }

  private recordRequestDuration(durationMs: number): void {
    this.totalRequestDurationMs += durationMs;
    const count = this.metrics.networkRequests || 1;
    this.metrics.averageRequestDurationMs = this.totalRequestDurationMs / count;
  }

  private getMutationKey(screwName: string, methodName: string): string {
    return `${screwName}:${methodName}`;
  }

  private findFirstMatch(match: QueryMatchInput | QueryKey): QueryStoreEntry | undefined {
    return this.findMatchingEntries(match)[0];
  }

  private findMatchingEntries(match?: QueryMatchInput | QueryKey): QueryStoreEntry[] {
    const normalized = normalizeMatchInput(match);
    const entries = [...this.queryEntries.values()];

    if (!normalized) {
      return entries;
    }

    return entries.filter((entry) => {
      if (normalized.queryKey) {
        return serializeQueryKey(entry.queryKey) === serializeQueryKey(normalized.queryKey);
      }

      if (normalized.prefix && !keyStartsWith(entry.queryKey, normalized.prefix)) {
        return false;
      }

      if (normalized.screwName && entry.screwName !== normalized.screwName) {
        return false;
      }

      if (normalized.methodName && entry.methodName !== normalized.methodName) {
        return false;
      }

      return true;
    });
  }

  private async invalidateTargets(targets?: QueryInvalidationTarget[]): Promise<void> {
    if (!targets?.length) {
      return;
    }

    await Promise.all(targets.map((target) => this.invalidateQueries(mergeInvalidationTarget(target))));
  }

  private async refetchMatching(predicate: (entry: QueryStoreEntry) => boolean): Promise<void> {
    const entries = [...this.queryEntries.values()].filter(predicate);
    await Promise.all(
      entries.map((entry) =>
        this.fetchQuery(entry.screwName, entry.methodName, {
          args: entry.args,
          staleTime: entry.staleTime,
          cacheTime: entry.cacheTime,
          refetchOnReconnect: entry.refetchOnReconnect,
          refetchOnWindowFocus: entry.refetchOnWindowFocus
        }, { force: true }).catch(() => undefined)
      )
    );
  }

  private getPersistenceKey(queryKey: QueryKey): string {
    return `${this.getPersistStoreKey()}:query:${serializeQueryKey(queryKey)}`;
  }

  private getPersistStoreKey(): string {
    const namespace = this.options?.persist?.namespace ?? DEFAULT_PERSIST_NAMESPACE;
    const version = this.options?.persist?.version ?? 'v1';
    const tenantSuffix = this.options?.tenantId ? `:${this.options.tenantId}` : '';
    return `${namespace}:${version}${tenantSuffix}`;
  }
}

export const createReactScrewClient = (
  apiInstance: ApiInstance,
  screws: ScrewsMap,
  options?: ReactScrewClientOptions
): ReactScrewClient => new DefaultReactScrewClient(apiInstance, screws, options);
