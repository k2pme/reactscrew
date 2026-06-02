# Best Practices — reactscrew

> Configuration recommendations, cache strategies, default values, and common pitfalls.

---

## Table of Contents

- [1. Cache: Strategies and Recommended Values](#1-cache-strategies-and-recommended-values)
- [2. Screw Definitions](#2-screw-definitions)
- [3. Hooks: Usage Patterns](#3-hooks-usage-patterns)
- [4. Multi-Backend](#4-multi-backend)
- [5. Feedback and UX](#5-feedback-and-ux)
- [6. Orchestration (batch / workflow)](#6-orchestration-batch--workflow)
- [7. Observability](#7-observability)
- [8. Performance](#8-performance)
- [9. SSR and Server Components](#9-ssr-and-server-components)
- [10. Common Pitfalls](#10-common-pitfalls)

---

## 1. Cache: Strategies and Recommended Values

### Cache Hierarchy

```
Request → In-memory cache (hit?) → Network → In-memory cache → (IndexedDB persist?)
```

The in-memory cache is a `Map<QueryKey, QueryStoreEntry>`. IndexedDB persistence is optional.

### staleTime: The Most Important Value

| Data Type | Recommended staleTime | Rationale |
|-----------|----------------------|-----------|
| Near-static data (catalog, categories) | `5 * 60_000` (5min) | Rarely changes, no need to re-fetch |
| User profile | `60_000` (1min) | Changes infrequently within a session |
| Product list | `30_000` (30s) | Good balance between freshness and performance |
| Dashboard / metrics | `10_000` (10s) | Acceptable slight delay |
| Notifications / counters | `0` (no stale) | Always fresh |

```ts
const screw = {
  name: 'products',
  methods: {
    list: {
      type: 'query',
      route: '/products',
      httpMethod: 'GET',
      staleTime: 30_000,     // 30s before stale
      cacheTime: 5 * 60_000,  // 5min before GC
      refetchOnWindowFocus: true,
    },
  },
};
```

**Rule of thumb:** `staleTime` = the interval during which the user can see slightly outdated data without harming the experience. The higher it is, the fewer network requests occur.

### cacheTime: In-Memory Retention

| Scenario | Recommended cacheTime | Reason |
|----------|----------------------|--------|
| Frequently revisited page | `5 * 60_000` (5min) | User navigates within the app |
| Rarely visited page | `60_000` (1min) | No need to keep long |
| Large data payloads | `30_000` (30s) | Free memory quickly |

**Default value:** `300_000` (5min). When observers drop to 0, a `setTimeout` fires. After `cacheTime` ms, the entry is deleted.

### refetchOnWindowFocus

- **Enabled (`true`)** for data that must stay fresh (cart, notifications).
- **Disabled (`false`)** for stable data (catalog, categories).
- Generally unnecessary for single-page apps; useful for apps with multi-tab navigation.

### Cache Invalidation

Mutations should always declare `invalidateQueries`:

```ts
create: {
  type: 'mutation',
  route: '/products',
  httpMethod: 'POST',
  invalidateQueries: [
    { screwName: 'products', methodName: 'list' },   // invalidate the list
    { screwName: 'products' },                        // invalidate ALL queries for this screw
  ],
}
```

**Recommended pattern:** invalidate at the screw level for creations (`{ screwName: 'products' }`), at the method level for targeted updates (`{ screwName: 'products', methodName: 'get' }`).

### IndexedDB Persistence

```ts
const clientOptions = {
  persist: {
    version: '1.0',
    namespace: 'my-app',
  },
};
```

**When to use it:**
- Offline-accessible data
- State to restore on page reload
- Mobile apps / PWAs

**When to avoid:**
- Large data that is rarely reused
- Frequent writes (IndexedDB is slow)
- SSR (persist is ignored in server environments)

### Automatic Deduplication

reactscrew automatically deduplicates concurrent requests for the same cache key. If 50 components mount simultaneously and all request the same `useScrewQuery('products', 'list')`, only one network request is made:

```ts
// ReactScrewClient.ts (internal)
if (entry.inFlight && !fetchOptions?.force) {
  this.metrics.dedupedRequests += 1;
  return entry.inFlight;  // ← 50 calls = 1 request
}
```

Do not disable this feature; it is the primary performance advantage.

---

## 2. Screw Definitions

### Naming

```ts
// ✅ GOOD: singular, domain name
{ name: 'product', methods: { list, get, create, update } }

// ❌ BAD: generic or verbose
{ name: 'products-and-categories', methods: { getAllProducts, getSingleProductById } }
```

### Route

```ts
// Static route (GET /products)
route: '/products'

// Dynamic route (GET /products/5)
route: (params: { id: number }) => `/products/${params.id}`

// Route with query params
route: (params: { category?: string; page?: number }) => {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.page) qs.set('page', String(params.page));
  return `/products${qs.toString() ? `?${qs.toString()}` : ''}`;
}
```

### Custom queryKey

By default, the cache key is `[screwName, methodName, ...args]`. Customize it for finer deduplication:

```ts
get: {
  type: 'query',
  route: (params: { id: number }) => `/products/${params.id}`,
  queryKey: ({ screwName, methodName, args }) =>
    [screwName, methodName, args[0]?.id ?? null],
}
```

### optimisticUpdate

Use for instant UX. Always return a `rollback` function:

```ts
update: {
  type: 'mutation',
  route: (params: { id: number }) => `/products/${params.id}`,
  httpMethod: 'PATCH',
  optimisticUpdate: async ({ client, variables }) => {
    const prev = client.getQueryData(['product', 'list']);
    if (prev) {
      client.setQueryData(['product', 'list'], (current) =>
        current.map((p) => p.id === variables.id ? { ...p, ...variables } : p)
      );
    }
    return { rollback: () => { if (prev) client.setQueryData(['product', 'list'], prev); } };
  },
}
```

### documentedErrors

Declare known errors to enrich the generated `ReactScrewError`:

```ts
getProduct: {
  type: 'query',
  route: (params) => `/products/${params.id}`,
  httpMethod: 'GET',
  documentedErrors: [
    { status: '404', code: 'PRODUCT_NOT_FOUND', description: 'Product not found', retryable: false, uiHint: 'not-found' },
    { status: '500', code: 'SERVER_ERROR', description: 'Server error', retryable: true, uiHint: 'error' },
  ],
}
```

---

## 3. Hooks: Usage Patterns

### Always Type Your Hooks

```tsx
// ✅ GOOD: explicit types
const { data } = useScrewQuery<Product[]>('products', 'list');
const { mutateAsync } = useScrewMutation<Product, CreateProductInput>('products', 'create');

// ❌ BAD: implicit types
const { data } = useScrewQuery('products', 'list'); // data = unknown
```

### Conditional enabled

Use `enabled` for dependent queries:

```tsx
const { data: user } = useScrewQuery('users', 'get', {
  args: [{ id: userId }],
  enabled: !!userId,  // no request if userId is null/undefined
});

const { data: orders } = useScrewQuery('orders', 'list', {
  args: [{ userId: user?.id }],
  enabled: !!user?.id,  // wait for user to load
});
```

### select for Data Transformation

```tsx
// No manual transformation in render
// ❌ BAD
const { data } = useScrewQuery('products', 'list');
const titles = data?.map(p => p.title) ?? [];

// ✅ GOOD: dedicated select
const { data: titles } = useScrewQuery('products', 'list', {
  select: (data) => data.map(p => p.title),
});
```

### select for Single Items

```tsx
useScrewQuery('products', 'list', {
  select: (products) => products.find(p => p.id === 5),
});
```

### Mutation with Variables

```tsx
// Static route: one argument (body)
const { mutateAsync } = useScrewMutation<Order, CheckoutInput>('orders', 'checkout');
await mutateAsync({ cartId: 1, shippingAddress: 'Paris' });

// Dynamic route: two arguments (body, route params)
const { mutateAsync } = useScrewMutation<Cart, UpdateQuantityInput>('cart', 'update');
await mutateAsync({ quantity: 3 }, { itemId: 5 });
//                ^ body (POST data)    ^ route args
```

### Mutation and Navigation

```tsx
const mutation = useScrewMutation('orders', 'checkout');

const handleCheckout = async () => {
  try {
    await mutation.mutateAsync({ cartId: 1 });
    navigate('/orders');  // navigate after success
  } catch (error) {
    showError(error);  // explicit error handling
  }
};
```

---

## 4. Multi-Backend

### When to Use Multi-Backend

- Microservices with separate gateways
- Third-party public APIs (FakeStoreAPI + JSONPlaceholder)
- Gradual migration from one backend to another

### Automatic vs Explicit Routing

```tsx
// Automatic routing (by screw name)
useScrewQuery('product', 'list'); // searches all backends

// Explicit routing
useScrewQuery('product', 'list', { backend: 'products' });
```

**Recommendation:** use automatic routing during development, explicit routing in production for ambiguous screws.

### Cache Isolation

Each backend has its own `ReactScrewClient`. Data from one backend never leaks into another. Metrics are also isolated.

### Mix Legacy + Backends

```tsx
<DriverProvider
  apiInstance={defaultApi}
  screws={{ legacy: { name: 'legacy', methods: { ... } } }}
  backends={{
    billing: { apiInstance: billingApi, screws: { invoice: { ... } } },
  }}
/>
```

Screws declared in `screws` are treated as a default backend.

---

## 5. Feedback and UX

### FeedbackProvider Configuration

```tsx
<FeedbackProvider config={{
  toasts: {
    onSuccess: true,                        // auto toast on successful mutation
    onError: [                              // error → toast mapping
      { code: 'NETWORK_ERROR', variant: 'error', message: 'Network issue' },
      { status: 500, variant: 'error', duration: 8000 },
    ],
    defaultDuration: 4000,
    position: 'bottom-right',
    maxToasts: 3,
  },
  loaders: {
    enabled: true,
    defaultVariant: 'spinner',
    policy: { minDuration: 300 },           // avoid flash for fast requests
  },
}}>
  <App />
</FeedbackProvider>
```

### Toasts Only for User Actions

Auto-toasts (`onSuccess: true`) are useful for user-triggered mutations (create, update, delete). Avoid toasts on silent refetches.

### Loader Minimum Duration

```ts
policy: { minDuration: 300 }
```

Prevents loading flashes for requests under 300ms. The user never sees a loader that disappears instantly.

---

## 6. Orchestration (batch / workflow)

### When to Use batch vs workflow

| Scenario | Solution |
|----------|----------|
| Independent actions (e.g., ordering multiple items) | `useScrewBatch` |
| Sequential steps with dependencies (e.g., pay → ship) | `useScrewWorkflow` |
| Parallel actions with dependencies | `useScrewWorkflow` with `parallel: true` |
| UI that tracks progress | `useScrewProgress` |

### Workflow: Retry Configuration

```ts
{
  id: 'payment',
  screwName: 'billing',
  methodName: 'charge',
  retry: 2,                // 2 additional attempts (3 total)
  retryDelay: 1000,        // 1s between attempts
}
```

### Workflow: continueOnError

```ts
{
  id: 'notify',
  screwName: 'notifications',
  methodName: 'email',
  continueOnError: true,   // workflow continues even if this step fails
  dependsOn: ['payment'],
}
```

Used for notifications, logs, or non-critical actions.

### Workflow: Conditions and Gating

Use workflow-level conditions to guard the entire workflow, and step-level conditions to gate individual steps:

```ts
// Workflow-level: only run if cart has items
condition: (ctx) => {
  const cart = ctx.getScrewData('cart', 'get');
  return cart?.items?.length >= (ctx.variables?.minItems ?? 1);
},
waitForCondition: true,   // poll every 500ms until condition passes (max 30s)
variables: { minItems: 1 },
```

```ts
// Step-level: only run this step if a prior step met a condition
{
  id: 'apply-discount',
  screwName: 'cart',
  methodName: 'applyCoupon',
  condition: (ctx) => ctx.stepResults['checkout']?.data?.total > 100,
  waitForCondition: false,
}
```

### Workflow: Variable Injection

Pass configuration data into conditions via `variables`. This keeps conditions testable and decoupled from closure scope:

```ts
variables: { minItems: 1, enableTracking: true, shippingCutoff: '18:00' },
condition: (ctx) => {
  return ctx.stepResults['checkout']?.data?.shipped === true
    && ctx.variables?.enableTracking === true;
},
```

### Workflow: Declarative Workflows

Define workflows inside `ScrewDefinition.workflows` for self-documenting, co-located orchestration:

```ts
const cartScrew: ScrewDefinition = {
  name: 'cart',
  methods: { get: { type: 'query', route: '/cart', httpMethod: 'GET' } },
  workflows: {
    checkout: {
      config: {
        steps: [
          { id: 'validate', screwName: 'cart', methodName: 'get' },
          { id: 'checkout', screwName: 'orders', methodName: 'checkout', dependsOn: ['validate'] },
        ],
        condition: (ctx) => !!ctx.getScrewData('cart', 'get')?.items?.length,
        waitForCondition: true,
      },
      autoStart: false,
    },
  },
};
```

### Workflow: onStepCondition Callback

Use `onStepCondition` to react when a condition blocks execution — show a "waiting" state, trigger external events, or log:

```ts
onStepCondition: (result) => {
  if (!result.passed && result.skipped === false) {
    setWaitingSteps((prev) => [...prev, result.stepId]);
    setStatus('waiting');
  }
},
```

### Workflow: Polling Behavior

When `waitForCondition: true`, the engine polls every **500ms** and re-evaluates the condition function with fresh `getScrewData` values. After **60 failed attempts** (~30s), the workflow marks the step/workflow as `failed` with a timeout error.

Design your conditions to be idempotent — they should read state rather than mutate it.

---

## 7. Observability

### Logger

```ts
const logger = createScrewLogger({
  level: 'info',
  format: 'json',       // for production (easy to parse)
  prefix: '[my-app]',
});

logger.info('User action', { userId: 123, action: 'checkout' });
```

### Sentry

```ts
const unsubscribe = withSentry(client, Sentry, {
  captureErrors: true,
  tags: { environment: 'production', version: '1.2.3' },
});

// Don't forget to clean up
// useEffect(() => unsubscribe, []);
```

### OpenTelemetry

```ts
const cleanup = withOpenTelemetry(client, tracer);
// Each request creates a span
```

---

## 8. Performance

### Golden Rules

1. **`staleTime` is your best friend.** The higher it is, the fewer network requests.
2. **Use `select`** to avoid recomputing transformed data on every render.
3. **Do not disable deduplication.** It is reactscrew's main advantage.
4. **`enabled: false`** for queries that depend on not-yet-loaded data.
5. **Avoid IndexedDB persistence** unless you need it. Writes are expensive.
6. **Use `useInfiniteScrewQuery`** for potentially long lists instead of loading everything at once.

### Metrics to Monitor

```tsx
const devtools = useScrewDevtools();
// devtools.metrics.dedupedRequests — number of deduplicated requests
// devtools.metrics.cacheMisses — number of cache misses
// devtools.metrics.averageRequestDurationMs — average network performance
```

### Bundle Size

reactscrew weighs ~5kB (gzip). `localforage` (if persist is enabled) adds ~9kB (gzip). If you do not use persistence, it is tree-shaken.

---

## 9. SSR and Server Components

### Server-side Prefetch

```tsx
// app/page.tsx — Server Component
const client = createReactScrewClient(api, { user: userScrew });
await client.prefetchQuery('user', 'list');
const dehydratedState = client.dehydrate();

return <UsersCLient dehydratedState={dehydratedState} />;
```

### Client-side Hydration

```tsx
// Client Component
<DriverProvider apiInstance={api} screws={{ user: userScrew }}
  dehydratedState={dehydratedState}>
  <App />
</DriverProvider>
```

### Important Notes

- Do not enable `persist` (IndexedDB) in SSR — it is automatically ignored.
- `createReactScrewClient` is pure and safe for server usage.
- Hooks (`useScrewQuery`, etc.) are marked `'use client'`.

---

## 10. Common Pitfalls

### ❌ Query Without Conditional enabled

```tsx
// BUG: args[0] is undefined on first render, route receives undefined
const { data } = useScrewQuery('products', 'get', {
  args: [{ id: productId }],
});

// ✅ FIX
const { data } = useScrewQuery('products', 'get', {
  args: [{ id: productId }],
  enabled: productId != null,
});
```

### ❌ Mutation Without Error Handling

```tsx
// BUG: if mutation fails, the error goes unhandled
mutate(newData);

// ✅ FIX
try {
  await mutateAsync(newData);
} catch (error) {
  // error is a normalized ReactScrewError, directly usable
  showError(error);
}
```

### ❌ Query Chain Without enabled

```tsx
// BUG: orders list fetches before user is loaded
const { data: user } = useScrewQuery('users', 'get', { args: [{ id }] });
const { data: orders } = useScrewQuery('orders', 'list', { args: [{ userId: user?.id }] });

// ✅ FIX
const { data: user } = useScrewQuery('users', 'get', { args: [{ id }] });
const { data: orders } = useScrewQuery('orders', 'list', {
  args: [{ userId: user?.id }],
  enabled: !!user?.id,
});
```

### ❌ Missing invalidateQueries

```ts
// BUG: after creation, the list is not refreshed
create: {
  type: 'mutation',
  route: '/products',
  httpMethod: 'POST',
  // no invalidateQueries
}

// ✅ FIX
create: {
  type: 'mutation',
  route: '/products',
  httpMethod: 'POST',
  invalidateQueries: [{ screwName: 'products' }],
}
```

### ❌ Hardcoded Routes Instead of Functions

```ts
// BUG: always /products/1, even if the ID changes
get: { type: 'query', route: '/products/1', httpMethod: 'GET' }

// ✅ FIX
get: { type: 'query', route: (p: { id: number }) => `/products/${p.id}`, httpMethod: 'GET' }
```

### ❌ Optimistic Update Without Rollback

```ts
// BUG: if mutation fails, the cache stays in optimistic state
optimisticUpdate: async ({ client, variables }) => {
  client.setQueryData(['product', 'list'], updater);
  // no rollback → corrupted data on error
}

// ✅ FIX
optimisticUpdate: async ({ client, variables }) => {
  const prev = client.getQueryData(['product', 'list']);
  client.setQueryData(['product', 'list'], updater);
  return { rollback: () => client.setQueryData(['product', 'list'], prev) };
}
```

### ❌ Too Many Simultaneous Queries

```tsx
// BUG: 20 components with the same useScrewQuery = 1 request (OK)
// But 20 different useScrewQuery calls = 20 network requests

// ✅ SOLUTION: aggregate endpoints or use a timeout
// Example: load user data in a single /profile request
// rather than separate /user + /preferences + /notifications
```

### ❌ Workflow Condition That Mutates State

```ts
// BUG: side effects in conditions cause unpredictable behavior
condition: (ctx) => {
  localStorage.setItem('last-check', Date.now()); // side effect!
  return true;
}

// ✅ FIX: conditions are read-only
condition: (ctx) => {
  return !!ctx.getScrewData('cart', 'get')?.items?.length;
}
```

### ❌ Forgetting waitForCondition for Polling

```ts
// BUG: if condition fails, the workflow fails immediately
condition: (ctx) => ctx.ready === true,
// → workflow fails on first evaluation if not ready

// ✅ FIX: enable polling
condition: (ctx) => ctx.ready === true,
waitForCondition: true,  // retry every 500ms
```

### ❌ Confusing mutate and mutateAsync

```tsx
// Both mutate and mutateAsync return a Promise in reactscrew
const { mutate, mutateAsync } = useScrewMutation(...);

// ✅ for fire-and-forget
mutate(data);

// ✅ for await / try-catch
await mutateAsync(data);
```

Note: in reactscrew, `mutate` and `mutateAsync` are identical (both asynchronous). Both names are provided for compatibility with TanStack Query.
