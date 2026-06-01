# API Reference — reactscrew

> Complete documentation for every function, hook, component, and type exported by reactscrew.

---

## Table of Contents

- [Hooks](#hooks)
  - [useScrew](#usescrew)
  - [useScrewQuery](#usescrewquery)
  - [useScrewMutation](#usescrewmutation)
  - [useInfiniteScrewQuery](#useinfinitescrewquery)
  - [useScrewClient](#usescrewclient)
  - [useScrewEvents](#usescrewevents)
  - [useScrewDevtools](#usescrewdevtools)
  - [useScrewBatch](#usescrewbatch)
  - [useScrewWorkflow](#usescrewworkflow)
  - [useScrewProgress](#usescrewprogress)
  - [useScrewFeedback](#usescrewfeedback)
  - [useScrewToast](#usescrewtoast)
  - [useScrewLoader](#usescrewloader)
- [Components](#components)
  - [DriverProvider](#driverprovider)
  - [ScrewDevtools](#screwdevtools)
  - [FeedbackProvider](#feedbackprovider)
  - [ToastProvider](#toastprovider)
  - [LoaderProvider](#loaderprovider)
- [Transport Adapters](#transport-adapters)
  - [createFetchAdapter](#createfetchadapter)
  - [createAxiosAdapter](#createaxiosadapter)
  - [withAuthStrategy](#withauthstrategy)
  - [createProxyAdapter](#createproxyadapter)
- [Client](#client)
  - [createReactScrewClient](#createreactscrewclient)
  - [ReactScrewClient (interface)](#reactscrewclient-interface)
- [Orchestration](#orchestration)
  - [executeBatch](#executebatch)
  - [executeWorkflow](#executeworkflow)
- [Observability](#observability)
  - [createScrewLogger](#createscrewlogger)
  - [defaultLogger](#defaultlogger)
  - [withSentry](#withsentry)
  - [withOpenTelemetry](#withopentelemetry)
- [Errors](#errors)
  - [ReactScrewError](#reactscrewerror)
  - [normalizeError](#normalizeerror)
- [Runtime Validation](#runtime-validation)
  - [createSchemaValidator](#createschemavalidator)
  - [validateValueAgainstSchema](#validatevalueagainstschema)
  - [createParameterSchema](#createparameterschema)
- [OpenAPI Generation](#openapi-generation)
- [Core Types](#core-types)

---

## Hooks

### useScrew

Legacy hook. Prefer `useScrewQuery` / `useScrewMutation`.

```ts
useScrew<TData = unknown>(
  screwName: string
): LegacyUseScrewResult<TData>
```

**Arguments**

| Name | Type | Description |
|------|------|-------------|
| `screwName` | `string` | Name of the screw to use |

**Returns** `LegacyUseScrewResult<TData>`

| Property | Type | Description |
|----------|------|-------------|
| `status` | `'idle' \| 'loading' \| 'success' \| 'error' \| 'stale'` | Query status |
| `data` | `TData \| null` | Returned data |
| `error` | `ReactScrewErrorShape \| null` | Possible error |
| `isLoading` | `boolean` | First load in progress |
| `isFetching` | `boolean` | Network request in progress |
| `isRefetching` | `boolean` | Background refetch |
| `updatedAt` | `number \| null` | Last update timestamp |
| `invalidatedAt` | `number \| null` | Last invalidation timestamp |
| `refetch` | `() => Promise<TData>` | Force a reload |
| `executeMethod` | `<TReturn>(methodName: string, ...args: unknown[]) => Promise<TReturn>` | Execute a screw method |

**Example**
```tsx
const { data, isLoading, executeMethod } = useScrew('users');
// executeMethod('create', { name: 'Alice' })
```

---

### useScrewQuery

Typed query hook with cache, invalidation, and selector support.

```ts
useScrewQuery<TData = unknown>(
  screwName: string,
  methodName: string,
  options?: QueryObserverOptions<unknown[], TData>
): UseScrewQueryResult<TData>
```

**Arguments**

| Name | Type | Description |
|------|------|-------------|
| `screwName` | `string` | Screw name |
| `methodName` | `string` | Method name (type: 'query') |
| `options` | `QueryObserverOptions` (optional) | See below |

**Options** `QueryObserverOptions<TArgs, TData>`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `args` | `TArgs` | `[]` | Arguments passed to the screw's `route` function |
| `enabled` | `boolean` | `true` | Disables the query if `false` |
| `select` | `(data: TData) => unknown` | — | Transforms data (e.g. `data => data.items`) |
| `initialData` | `TData` | — | Initial data before fetch |
| `placeholderData` | `TData` | — | Placeholder data during loading |
| `staleTime` | `number` (ms) | `0` | Duration before data is considered stale |
| `cacheTime` | `number` (ms) | `5 * 60_000` (5min) | Retention duration in cache after unsubscription |
| `refetchOnWindowFocus` | `boolean` | `false` | Refetch on window focus |
| `refetchOnReconnect` | `boolean` | `false` | Refetch on network reconnection |
| `backend` | `string` | — | Target backend (multi-backend) |
| `onSuccess` | `(data) => void` | — | Success callback |
| `onError` | `(error) => void` | — | Error callback |
| `onSettled` | `(data, error) => void` | — | Settled callback (success or error) |

**Returns** `UseScrewQueryResult<TData>`

| Property | Type | Description |
|----------|------|-------------|
| `status` | `QueryStatus` | `'idle' \| 'loading' \| 'success' \| 'error' \| 'stale'` |
| `data` | `TData \| null` | Data (transformed by `select` if provided) |
| `error` | `ReactScrewErrorShape \| null` | Error |
| `isLoading` | `boolean` | First load |
| `isFetching` | `boolean` | Request in progress (including refetch) |
| `isRefetching` | `boolean` | Background refetch |
| `updatedAt` | `number \| null` | Last update timestamp |
| `invalidatedAt` | `number \| null` | Last invalidation timestamp |
| `refetch` | `() => Promise<TData>` | Force a refetch |
| `queryKey` | `QueryKey` | Cache key used |

**Example**
```tsx
const { data, isLoading } = useScrewQuery('products', 'list', {
  args: [{ category: 'electronics' }],
  staleTime: 30_000,
  select: (data) => data.slice(0, 10),
});
```

---

### useScrewMutation

Typed mutation hook (POST, PUT, PATCH, DELETE).

```ts
useScrewMutation<TData = unknown, TVariables = unknown>(
  screwName: string,
  methodName: string,
  options?: UseScrewMutationOptions<TData, TVariables>
): UseScrewMutationResult<TData, TVariables>
```

**Arguments**

| Name | Type | Description |
|------|------|-------------|
| `screwName` | `string` | Screw name |
| `methodName` | `string` | Method name (type: 'mutation') |
| `options` | `UseScrewMutationOptions` (optional) | See below |

**Options** `UseScrewMutationOptions<TData, TVariables>`

| Property | Type | Description |
|----------|------|-------------|
| `backend` | `string` | Target backend (multi-backend) |
| `onSuccess` | `(data, variables) => void` | Success callback |
| `onError` | `(error, variables) => void` | Error callback |
| `onSettled` | `(data, error, variables) => void` | Settled callback |
| `optimisticUpdate` | `(context) => Promise<RollbackAction \| void>` | Optimistic cache update before network response |

**Returns** `UseScrewMutationResult<TData, TVariables>`

| Property | Type | Description |
|----------|------|-------------|
| `status` | `MutationStatus` | `'idle' \| 'pending' \| 'success' \| 'error'` |
| `data` | `TData \| null` | Response data |
| `error` | `ReactScrewErrorShape \| null` | Error |
| `isPending` | `boolean` | Mutation in progress |
| `mutate` | `(variables?, ...args) => Promise<TData>` | Triggers the mutation |
| `mutateAsync` | `(variables?, ...args) => Promise<TData>` | Same (alias) |
| `reset` | `() => void` | Resets state to 'idle' |

**Call pattern**
```tsx
// Static route (e.g. POST /orders)
const { mutateAsync } = useScrewMutation('orders', 'checkout');
await mutateAsync({ cartId: 1, shippingAddress: 'Paris' });

// Dynamic route (e.g. PATCH /cart/{itemId})
const { mutateAsync } = useScrewMutation('cart', 'update');
await mutateAsync({ quantity: 3 }, { itemId: 5 });
// body = { quantity: 3 }, route params = { itemId: 5 }
```

---

### useInfiniteScrewQuery

Paginated/cursor-based query hook.

```ts
useInfiniteScrewQuery<TPageData = unknown, TPageParam = unknown>(
  screwName: string,
  methodName: string,
  options: InfiniteQueryObserverOptions<TPageData, TPageParam>
): UseInfiniteScrewQueryResult<TPageData, never, TPageParam>
```

**Options** `InfiniteQueryObserverOptions<TPageData, TPageParam>`

| Property | Type | Description |
|----------|------|-------------|
| `initialPageParam` | `TPageParam` | Parameter for the first page (e.g. `0`, `undefined`, `'cursor_abc'`) |
| `getNextPageParam` | `(lastPage, allPages, lastPageParam) => TPageParam \| undefined` | Computes the next page parameter. Return `undefined` to signal the end |
| *(inherits all QueryObserverOptions properties)* | | |

**Returns** `UseInfiniteScrewQueryResult<TPageData, TError, TPageParam>`

| Property | Type | Description |
|----------|------|-------------|
| `data` | `TPageData[]` | All accumulated pages |
| `fetchNextPage` | `() => Promise<TPageData[]>` | Loads the next page |
| `hasNextPage` | `boolean` | `true` if `getNextPageParam` returned a value |
| `pageParams` | `TPageParam[]` | Parameters for each loaded page |
| *(inherits all UseScrewQueryResult properties)* | | |

**Example**
```tsx
const { data: pages, fetchNextPage, hasNextPage } = useInfiniteScrewQuery('products', 'list', {
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages, lastPageParam) =>
    lastPage.length === 0 ? undefined : lastPageParam + 1,
  args: [{ limit: 20 }],
});

<button onClick={fetchNextPage} disabled={!hasNextPage}>
  Load more ({pages.length} pages loaded)
</button>
```

---

### useScrewClient

Accesses the ReactScrewClient from context.

```ts
useScrewClient(): ReactScrewClient
```

**Returns** `ReactScrewClient` — the full client (cache read/write, fetch, mutations, etc.).

---

### useScrewEvents

Subscribes to request lifecycle events.

```ts
useScrewEvents(listener: (event: RequestEvent) => void): void
```

**Event** `RequestEvent`

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'query:start' \| 'query:success' \| 'query:error' \| 'query:invalidate' \| 'mutation:start' \| 'mutation:success' \| 'mutation:error'` | Event type |
| `screwName` | `string` | Screw involved |
| `methodName` | `string` | Method involved |
| `queryKey` | `QueryKey \| undefined` | Cache key (queries) |
| `mutationKey` | `string \| undefined` | Mutation key |
| `status` | `number \| undefined` | HTTP status code |
| `durationMs` | `number \| undefined` | Request duration |
| `timestamp` | `number` | Timestamp |
| `error` | `ReactScrewErrorShape \| null \| undefined` | Possible error |

**Example**
```tsx
useScrewEvents((event) => {
  if (event.type === 'query:success') {
    console.log(`✅ ${event.screwName}.${event.methodName} in ${event.durationMs}ms`);
  }
});
```

---

### useScrewDevtools

Snapshot of internal state for debugging.

```ts
useScrewDevtools(): ScrewDevtoolsSnapshot
```

**Returns** `ScrewDevtoolsSnapshot`

| Property | Type | Description |
|----------|------|-------------|
| `queries` | `QuerySnapshot[]` | All query states in the cache |
| `mutations` | `MutationSnapshot[]` | All mutation states |
| `metrics` | `ClientMetrics` | Metrics (hits, misses, requests, avg duration) |
| `events` | `RequestEvent[]` | Event history |

---

### useScrewBatch

Executes a batch of mutation actions in parallel.

```ts
useScrewBatch(
  initialActions?: BatchAction[],
  options?: UseScrewBatchOptions
): UseScrewBatchReturn
```

**`BatchAction`**

| Property | Type | Description |
|----------|------|-------------|
| `screwName` | `string` | Target screw |
| `methodName` | `string` | Mutation method |
| `variables?` | `unknown` | Request body |
| `args?` | `unknown[]` | Route arguments |
| `label?` | `string` | Display label |
| `backend?` | `string` | Target backend |

**Returns** `UseScrewBatchReturn`

| Property | Type | Description |
|----------|------|-------------|
| `execute` | `(actions?: BatchAction[]) => Promise<BatchResult>` | Runs the batch |
| `result` | `BatchResult \| null` | Last execution result |
| `progress` | `ProgressSnapshot \| null` | Real-time progress |
| `isExecuting` | `boolean` | Currently executing |
| `reset` | `() => void` | Resets state |

**`BatchResult`**

| Property | Type | Description |
|----------|------|-------------|
| `steps` | `StepResult[]` | Result of each step |
| `summary` | `BatchSummary` | Summary (total, succeeded, failed, durationMs) |
| `status` | `'completed' \| 'partial' \| 'failed'` | Overall status |

**Example**
```tsx
const { execute, isExecuting } = useScrewBatch([
  { screwName: 'orders', methodName: 'checkout', variables: { cartId: 1 }, backend: 'orders' },
  { screwName: 'inventory', methodName: 'reserve', variables: { productId: 5 } },
]);

<button onClick={() => execute()} disabled={isExecuting}>
  {isExecuting ? '⏳' : '⚡ Order all'}
</button>
```

---

### useScrewWorkflow

Orchestrates sequential steps with dependencies, retry, and parallelism.

```ts
useScrewWorkflow(
  config?: WorkflowConfig,
  options?: UseScrewWorkflowOptions
): UseScrewWorkflowReturn
```

**`WorkflowStep`**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | — | Unique step identifier |
| `screwName` | `string` | — | Target screw |
| `methodName` | `string` | — | Mutation method |
| `variables?` | `unknown` | — | Request body |
| `args?` | `unknown[]` | — | Route arguments |
| `label?` | `string` | — | Display label |
| `dependsOn?` | `string[]` | `[]` | Steps to execute before this one |
| `retry?` | `number` | `0` | Additional attempts |
| `retryDelay?` | `number` (ms) | `500` | Delay between retries |
| `parallel?` | `boolean` | `false` | Can execute in parallel |
| `continueOnError?` | `boolean` | `false` | Continue if step fails |
| `backend?` | `string` | — | Target backend |

**Returns** `UseScrewWorkflowReturn`

| Property | Type | Description |
|----------|------|-------------|
| `execute` | `(steps?: WorkflowStep[]) => Promise<{ steps: StepResult[]; status: string }>` | Runs the workflow |
| `result` | `{ steps: StepResult[]; status: string } \| null` | Last result |
| `progress` | `ProgressSnapshot \| null` | Progress |
| `isExecuting` | `boolean` | Currently executing |
| `reset` | `() => void` | Resets state |

**Example**
```tsx
const { execute } = useScrewWorkflow({
  steps: [
    { id: 'reserve',  screwName: 'inventory', methodName: 'reserve', variables: { productId: 5 } },
    { id: 'payment',  screwName: 'billing',   methodName: 'charge',  variables: { amount: 99 }, dependsOn: ['reserve'] },
    { id: 'ship',     screwName: 'logistics', methodName: 'ship',    variables: {}, dependsOn: ['payment'], retry: 2 },
  ],
});

<button onClick={() => execute()}>🔁 Run</button>
```

---

### useScrewProgress

Derives a unified `ProgressSnapshot` from a batch or workflow source.

```ts
useScrewProgress(source: UseScrewProgressSource): ProgressSnapshot | null
```

**`ProgressSnapshot`**

| Property | Type | Description |
|----------|------|-------------|
| `percentage` | `number` | Progress 0–100 |
| `currentStep` | `string \| null` | Current step |
| `itemsProcessed` | `number` | Completed steps |
| `itemsTotal` | `number` | Total steps |
| `failures` | `number` | Number of failures |
| `elapsedMs` | `number` | Elapsed time |
| `estimatedTotalMs` | `number \| null` | Estimated total time |
| `phase` | `'idle' \| 'running' \| 'completed' \| 'failed'` | Phase |

---

### useScrewFeedback

Combined hook for toasts, loaders, success/error feedback.

```ts
useScrewFeedback(): {
  addToast(message: string, variant?: ToastVariant, duration?: number): string;
  removeToast(id: string): void;
  showLoader(key: string, variant?: LoaderVariant, message?: string): void;
  hideLoader(key: string): void;
  onSuccess(message: string): void;
  onError(error: { message?: string; code?: string; uiHint?: string }): void;
}
```

---

### useScrewToast

Adds/removes toasts programmatically.

```ts
useScrewToast(): {
  toasts: Toast[];
  addToast(toast: Omit<Toast, 'id' | 'createdAt'>): string;
  removeToast(id: string): void;
  clearToasts(): void;
}
```

---

### useScrewLoader

Shows/hides loading indicators.

```ts
useScrewLoader(): {
  loaders: Record<string, LoaderState>;
  showLoader(key: string, variant?: LoaderVariant, message?: string): void;
  hideLoader(key: string): void;
  isLoading: boolean;
}
```

---

## Components

### DriverProvider

Root component that provides the reactscrew context (cache, transport, screws).

```tsx
<DriverProvider
  apiInstance?: ApiInstance
  screws?: ScrewsMap
  clientOptions?: ReactScrewClientOptions
  dehydratedState?: DehydratedState
  backends?: Record<string, BackendConfig>
>
  {children}
</DriverProvider>
```

**Props**

| Property | Type | Description |
|----------|------|-------------|
| `children` | `ReactNode` | Application content |
| `apiInstance` | `ApiInstance` | Transport adapter (fetch/axios) |
| `screws` | `ScrewsMap` | Screw definitions |
| `clientOptions` | `ReactScrewClientOptions` | Cache options (persist, observer) |
| `dehydratedState` | `DehydratedState` | SSR pre-filled state |
| `backends` | `Record<string, BackendConfig>` | Multi-backend configuration |

**Single backend mode**
```tsx
<DriverProvider apiInstance={api} screws={{ users: userScrew }}>
  <App />
</DriverProvider>
```

**Multi-backend mode**
```tsx
<DriverProvider backends={{
  products: { apiInstance: productsApi, screws: { product: { ... } } },
  users: { apiInstance: usersApi, screws: { user: { ... } } },
}}>
  <App />
</DriverProvider>
```

**SSR mode**
```tsx
<DriverProvider apiInstance={api} screws={{ user: userScrew }}
  dehydratedState={dehydratedState}>
  <App />
</DriverProvider>
```

---

### ScrewDevtools

Visual debugging panel.

```tsx
<ScrewDevtools
  defaultTab?: 'queries' | 'mutations' | 'metrics' | 'events' | 'cache'
  defaultOpen?: boolean
/>
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `defaultTab` | `Tab` | `'queries'` | Default tab |
| `defaultOpen` | `boolean` | `false` | Panel expanded by default |

---

### FeedbackProvider

Automatic wiring of request events → toasts + loaders.

```tsx
<FeedbackProvider
  config: FeedbackConfig
>
  {children}
</FeedbackProvider>
```

**`FeedbackConfig`**

```ts
{
  toasts?: {
    onSuccess?: boolean | { message?: string; duration?: number };   // auto toast on success
    onError?: boolean | ToastErrorMapping[];                          // auto toast on error
    defaultDuration?: number;                                         // default duration (ms)
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    maxToasts?: number;                                               // max concurrent toasts
  };
  loaders?: {
    enabled?: boolean;                                               // auto loader on requests
    defaultVariant?: 'spinner' | 'skeleton' | 'progress' | 'shimmer' | 'overlay';
    policy?: { minDuration?: number };                                // minimum display duration
  };
}
```

---

### ToastProvider

Toast notification system.

```tsx
<ToastProvider
  position?: 'top-right'                          // default
  duration?: number                               // default: 5000ms
  maxToasts?: number                              // default: 5
  renderToast?: (toast: Toast, onRemove) => ReactNode  // custom render
>
  {children}
</ToastProvider>
```

---

### LoaderProvider

Loading indicators.

```tsx
<LoaderProvider
  defaultVariant?: 'spinner' | 'skeleton' | 'progress' | 'shimmer' | 'overlay'
  policy?: { minDuration?: number }
>
  {children}
</LoaderProvider>
```

---

## Transport Adapters

### createFetchAdapter

HTTP adapter based on the Fetch API.

```ts
createFetchAdapter(
  baseUrl?: string,
  defaultHeaders?: Record<string, string>
): ApiInstance
```

**Arguments**

| Name | Type | Description |
|------|------|-------------|
| `baseUrl` | `string` (optional) | Base URL (e.g. `'https://api.example.com'`) |
| `defaultHeaders` | `Record<string, string>` (optional) | Default headers |

**Returns** `ApiInstance` — function `(config) => Promise<ApiResponse>`

**Example**
```ts
const api = createFetchAdapter('https://jsonplaceholder.typicode.com', {
  'Accept': 'application/json',
});
```

---

### createAxiosAdapter

HTTP adapter wrapping an Axios-like instance.

```ts
createAxiosAdapter(instance: AxiosLikeInstance): ApiInstance
```

**Arguments**

| Name | Type | Description |
|------|------|-------------|
| `instance` | `AxiosLikeInstance` | Axios instance (or compatible) |

**Returns** `ApiInstance`

**Example**
```ts
import axios from 'axios';
const api = createAxiosAdapter(axios.create({ baseURL: 'https://api.example.com' }));
```

---

### withAuthStrategy

Wrapper that injects authentication tokens.

```ts
withAuthStrategy(
  apiInstance: ApiInstance,
  strategy: AuthStrategy
): ApiInstance
```

**`AuthStrategy`**

| Property | Type | Description |
|----------|------|-------------|
| `getAccessToken` | `() => string \| null \| Promise<string \| null>` | Retrieves the token |
| `refreshAccessToken` | `() => Promise<string \| null>` | Refreshes the token |
| `onAuthFailure` | `(error) => void \| Promise<void>` | Auth failure callback |
| `headerName` | `string` | Header name (default: `'Authorization'`) |
| `headerPrefix` | `string` | Header prefix (default: `'Bearer'`) |

**Example**
```ts
const api = withAuthStrategy(createFetchAdapter('https://api.example.com'), {
  getAccessToken: () => localStorage.getItem('token'),
  refreshAccessToken: async () => { /* refresh logic */ },
});
```

---

### createProxyAdapter

Rewrites URLs before sending.

```ts
createProxyAdapter(
  apiInstance: ApiInstance,
  rulesOrResolver: ProxyRule[] | ProxyUrlResolver
): ApiInstance
```

**`ProxyRule`**

```ts
{ prefix: string; target: string }
// Ex: { prefix: '/api', target: 'https://backend.internal/api' }
```

**`ProxyUrlResolver`**

```ts
(url: string) => string
// Ex: (url) => url.replace('/v1', '/v2')
```

---

## Client

### createReactScrewClient

Creates a standalone client (usable outside React, e.g. for SSR).

```ts
createReactScrewClient(
  apiInstance: ApiInstance,
  screws: ScrewsMap,
  options?: ReactScrewClientOptions
): ReactScrewClient
```

**`ReactScrewClientOptions`**

| Property | Type | Description |
|----------|------|-------------|
| `persist` | `PersistedCacheConfig` | IndexedDB persistence configuration |
| `observer` | `RequestObserver` | Event observer |
| `tenantId` | `string` | Tenant identifier (multi-tenant) |
| `auth` | `AuthStrategy` | Authentication strategy |

**SSR Example**
```tsx
const client = createReactScrewClient(api, { user: userScrew });
await client.prefetchQuery('user', 'list');
const dehydratedState = client.dehydrate();
```

---

### ReactScrewClient (interface)

Full client interface.

```ts
interface ReactScrewClient {
  // Cache read/write
  getQueryData<TData>(match): TData | null;
  setQueryData<TData>(match, updater): void;
  patchQueryState(match, patch): void;
  invalidateQueries(match?): Promise<void>;

  // Queries
  getQueryKey(screwName, methodName, options?): QueryKey;
  fetchQuery<TData>(screwName, methodName, options?, fetchOptions?): Promise<TData>;
  prefetchQuery<TData>(screwName, methodName, options?): Promise<TData>;

  // Mutations
  executeMutation<TData, TVariables>(screwName, methodName, variables?, args?, options?): Promise<TData>;

  // Subscriptions
  subscribeQuery(queryKey, listener): () => void;
  subscribeMutation(mutationKey, listener): () => void;
  subscribeEvents(listener): () => void;

  // State
  getQueryState(queryKey): QueryState;
  getMutationState(mutationKey): MutationState;
  resetMutationState(mutationKey): void;

  // Metrics & snapshots
  getMetrics(): ClientMetrics;
  getQuerySnapshots(): QuerySnapshot[];
  getMutationSnapshots(): MutationSnapshot[];
  getEvents(): RequestEvent[];

  // SSR hydration
  dehydrate(): DehydratedState;
  hydrate(state: DehydratedState): void;

  // Persistence
  persistCache(): Promise<void>;
  restorePersistedCache(): Promise<void>;

  // Focus/network handling
  handleWindowFocus(): Promise<void>;
  handleReconnect(): Promise<void>;

  // Legacy
  hasMethod(screwName, methodName): boolean;
  executeLegacyMethod<TReturn>(screwName, methodName, ...args): Promise<TReturn>;
}
```

---

## Orchestration

### executeBatch

Pure (non-React) version of batch execution.

```ts
executeBatch(
  actions: BatchAction[],
  ctx: ExecutionContext
): Promise<BatchResult>
```

**`ExecutionContext`**

| Property | Type | Description |
|----------|------|-------------|
| `client` | `ReactScrewClient` | Client for API calls |
| `resolveClient` | `(screwName, backend?) => ReactScrewClient` | Multi-backend resolution |
| `onProgress` | `(snapshot) => void` | Progress callback |
| `signal` | `AbortSignal` | Cancellation signal |

---

### executeWorkflow

Pure (non-React) version of workflow execution.

```ts
executeWorkflow(
  config: WorkflowConfig,
  ctx: ExecutionContext
): Promise<{ steps: StepResult[]; status: 'completed' | 'failed' | 'partial' }>
```

---

## Observability

### createScrewLogger

Creates a structured logger.

```ts
createScrewLogger(config?: LoggerConfig): ScrewLogger
```

**`LoggerConfig`**

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `level` | `'debug' \| 'info' \| 'warn' \| 'error'` | `'info'` | Minimum level |
| `format` | `'pretty' \| 'json'` | `'pretty'` | Output format |
| `prefix` | `string` | `''` | Message prefix |
| `enabled` | `boolean` | `true` | Enable/disable |

**Returns** `ScrewLogger`

```ts
{
  debug(msg: string, meta?: Record<string, unknown>): void;
  info(msg: string, meta?: Record<string, unknown>): void;
  warn(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
  child(prefix: string): ScrewLogger;  // creates a child logger
}
```

### defaultLogger

Default logger (info/pretty).

```ts
defaultLogger: ScrewLogger
```

### withSentry

Integrates reactscrew events with Sentry.

```ts
withSentry(
  client: ReactScrewClient,
  sentry: SentryLikeInstance,
  options?: { captureErrors?: boolean; tags?: Record<string, string> }
): () => void  // returns cleanup function (unsubscribe)
```

### withOpenTelemetry

Integrates OpenTelemetry tracing.

```ts
withOpenTelemetry(
  client: ReactScrewClient,
  tracer: OTelTracerLike
): () => void  // returns cleanup function
```

---

## Errors

### ReactScrewError

Normalized error with code, status, and UI hint.

```ts
new ReactScrewError(
  message: string,
  options: {
    code: string;
    status?: number;
    description?: string;
    details?: unknown;
    cause?: unknown;
    retryable?: boolean;
    uiHint?: 'error' | 'warning' | 'not-found' | 'auth' | 'timeout' | 'network';
  }
): ReactScrewError
```

**`uiHint`** guides feedback components on appropriate display.

### normalizeError

Normalizes any thrown value into a `ReactScrewError`.

```ts
normalizeError(
  error: unknown,
  message: string,
  documentedErrors?: DocumentedErrorDefinition[]
): ReactScrewError
```

---

## Runtime Validation

### createSchemaValidator

Creates a validator from an OpenAPI schema.

```ts
createSchemaValidator<TValue = unknown>(
  schema?: OpenApiSchemaObject,
  context?: string
): RuntimeValidator<TValue>
```

### validateValueAgainstSchema

Validates a value on the fly.

```ts
validateValueAgainstSchema(
  value: unknown,
  schema?: OpenApiSchemaObject,
  context?: string
): unknown
```

### createParameterSchema

Builds an object schema from OpenAPI parameter definitions.

```ts
createParameterSchema(parameters: OpenApiParameterObject[]): OpenApiSchemaObject
```

---

## OpenAPI Generation

All OpenAPI generation functions are **browser-safe** (no `fs` dependency).

```ts
parseOpenApiDocument(document: OpenApiDocument, source?: string): ParsedOpenApiContract
validateOpenApiContract(contract: ParsedOpenApiContract): OpenApiValidationResult
generateScrewsFromOpenApiContract(contract: ParsedOpenApiContract): string
generateScrewsFromOpenApiDocument(document: OpenApiDocument): string
generateOpenApiArtifacts(contract: ParsedOpenApiContract): GeneratedOpenApiArtifacts
generateOpenApiArtifactsFromDocument(document: OpenApiDocument, source?: string): GeneratedOpenApiArtifacts
```

**`GeneratedOpenApiArtifacts`**

```ts
{
  contract: ParsedOpenApiContract;
  files: Record<string, string>;  // filename → content
}
```

Generated files: `types/index.ts`, `errors/index.ts`, `validators/index.ts`, `screws/index.ts`, `hooks/index.ts`, `index.ts`.

---

## Core Types

| Type | Definition |
|------|-----------|
| `HttpMethod` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` |
| `QueryStatus` | `'idle' \| 'loading' \| 'success' \| 'error' \| 'stale'` |
| `MutationStatus` | `'idle' \| 'pending' \| 'success' \| 'error'` |
| `ScrewDefinition` | `{ name: string; methods: Record<string, ScrewMethodDefinition>; executeOnLaunch?: boolean; persistence?: boolean }` |
| `ScrewMethodDefinition` | `QueryDefinition \| MutationDefinition` |
| `QueryDefinition` | `{ type?: 'query'; route; staleTime; cacheTime; queryKey; refetchOnWindowFocus; refetchOnReconnect; … }` |
| `MutationDefinition` | `{ type?: 'mutation'; route; invalidateQueries; optimisticUpdate; bodyValidator; … }` |
| `BackendConfig` | `{ apiInstance: ApiInstance; screws: ScrewsMap; clientOptions?; dehydratedState? }` |
| `ApiInstance` | `(config: ApiRequestConfig) => Promise<ApiResponse>` |
| `AuthStrategy` | `{ getAccessToken?; refreshAccessToken?; onAuthFailure?; headerName?; headerPrefix? }` |
| `ReactScrewErrorShape` | `Error & { code; status?; description?; details?; retryable?; uiHint? }` |
| `QueryObserverOptions` | `{ args?; enabled?; select?; staleTime?; cacheTime?; refetchOnWindowFocus?; backend?; … }` |
| `UseScrewQueryResult` | `QueryState & { refetch; queryKey }` |
| `UseScrewMutationResult` | `MutationState & { mutate; mutateAsync; reset }` |
| `BatchAction` | `{ screwName; methodName; variables?; args?; backend? }` |
| `WorkflowStep` | `{ id; screwName; methodName; dependsOn?; retry?; continueOnError?; backend? }` |
| `ProgressSnapshot` | `{ percentage; currentStep; itemsProcessed; itemsTotal; phase; … }` |
| `RequestEvent` | `{ type; screwName; methodName; status?; durationMs?; error? }` |
| `DocumentedErrorDefinition` | `{ code; status?; description?; retryable?; uiHint? }` |
| `DehydratedState` | `{ queries: DehydratedQueryState[]; mutations: DehydratedMutationState[]; meta }` |
