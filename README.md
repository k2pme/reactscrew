# reactscrew

A typed React data layer built around domain modules called *screws*.

## Features

- **Typed hooks** — `useScrewQuery`, `useScrewMutation` with full generic inference
- **Cache** — In-memory cache with deduplication, invalidation, and versioned persistence
- **Multi-backend** — Route queries/mutations to different APIs by screw name
- **Infinite queries** — Cursor/page-based pagination out of the box
- **Hydration** — SSR/SSG via `dehydrate` / `hydrate`
- **Observability** — Devtools panel, request event stream, Sentry/OpenTelemetry integrations
- **Orchestration** — Batch, workflow, and progress tracking across backends
- **Transport adapters** — `fetch` and `axios`, with auth retry and proxy rewriting
- **OpenAPI generation** — Generate screws, hooks, types, and validators from OpenAPI specs
- **Error contract** — Unified `ReactScrewError` with `code`, `status`, `retryable`, `uiHint`
- **UX feedback** — Toast notifications and loading indicators wired to request lifecycle
- **Legacy API** — `useScrew` for gradual migration

## Installation

```bash
npm install reactscrew
```

`react` and `react-dom` (≥18) are peer dependencies.

## Quick Start

```jsx
import { createRoot } from 'react-dom/client';
import { DriverProvider, createFetchAdapter, useScrewQuery } from 'reactscrew';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

const userScrew = {
  name: 'user',
  methods: {
    list: { type: 'query', route: '/users', httpMethod: 'GET' },
    create: {
      type: 'mutation',
      route: '/users',
      httpMethod: 'POST',
      invalidateQueries: [{ screwName: 'user', methodName: 'list' }]
    }
  }
};

function App() {
  const { data, isLoading } = useScrewQuery('user', 'list');
  if (isLoading) return <p>Loading...</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

createRoot(document.getElementById('root')).render(
  <DriverProvider apiInstance={api} screws={{ user: userScrew }}>
    <App />
  </DriverProvider>
);
```

---

## 1. Declaring a Screw

A *screw* is a domain module that declares its API endpoints, validators, cache configuration, and invalidation relationships.

### Basic Structure

```ts
import type { ScrewDefinition } from 'reactscrew';

const productScrew: ScrewDefinition = {
  name: 'product',
  methods: {
    // ── Query (GET) ──
    list: {
      type: 'query',
      route: '/products',
      httpMethod: 'GET',
      staleTime: 30_000,          // 30s before stale
      cacheTime: 5 * 60_000,     // 5min before garbage collection
      refetchOnWindowFocus: true,
    },

    // ── Query with parameters ──
    get: {
      type: 'query',
      route: (params: { id: number }) => `/products/${params.id}`,
      httpMethod: 'GET',
      queryKey: ({ screwName, methodName, args }) =>
        [screwName, methodName, args[0] ?? null],
    },

    // ── Mutation (POST) with invalidation ──
    create: {
      type: 'mutation',
      route: '/products',
      httpMethod: 'POST',
      invalidateQueries: [
        { screwName: 'product', methodName: 'list' }
      ],
    },

    // ── Mutation (PATCH) with optimistic update ──
    update: {
      type: 'mutation',
      route: (params: { id: number }) => `/products/${params.id}`,
      httpMethod: 'PATCH',
      optimisticUpdate: async ({ client, variables }) => {
        await client.setQueryData(['product', 'get'], (prev) => ({
          ...prev, ...variables
        }));
        return { rollback: () => {} };
      },
    },
  },
};
```

### Method Properties

| Property | Type | Description |
|-----------|------|-------------|
| `type` | `'query' \| 'mutation'` | Inferred from `httpMethod` if omitted |
| `route` | `string \| (...args) => string` | URL template |
| `httpMethod` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` | HTTP verb |
| `staleTime` | `number` (ms) | Duration before data is considered stale |
| `cacheTime` | `number` (ms) | In-memory retention duration |
| `refetchOnWindowFocus` | `boolean` | Refetch on window focus |
| `refetchOnReconnect` | `boolean` | Refetch on network reconnection |
| `queryKey` | `(ctx) => QueryKey` | Custom cache key |
| `invalidateQueries` | `QueryInvalidationTarget[]` | Screws to invalidate after mutation |
| `optimisticUpdate` | `(ctx) => RollbackAction` | Optimistic update logic |
| `onSuccess` / `onError` / `onSettled` | `function` | Lifecycle callbacks |
| `headers` | `Record<string, string>` | Custom headers |
| `paramsValidator` / `responseValidator` | `RuntimeValidator` | Runtime validation |
| `documentedErrors` | `DocumentedErrorDefinition[]` | Error catalog |

Screws are used with `useScrewQuery` / `useScrewMutation`:

```tsx
const { data } = useScrewQuery('product', 'list');
const { mutate } = useScrewMutation('product', 'create');
```

---

## 2. Multi-Backend Management

reactscrew can route requests to multiple independent APIs from a single `DriverProvider`.

### Configuration

```tsx
import { DriverProvider, useScrewQuery, createFetchAdapter } from 'reactscrew';

const productsApi = createFetchAdapter('https://fakestoreapi.com');
const usersApi = createFetchAdapter('https://jsonplaceholder.typicode.com');

const backends = {
  products: {
    apiInstance: productsApi,
    screws: {
      product: {
        name: 'product',
        methods: {
          list: { type: 'query', route: '/products', httpMethod: 'GET' },
        },
      },
    },
  },
  users: {
    apiInstance: usersApi,
    screws: {
      user: {
        name: 'user',
        methods: {
          list: { type: 'query', route: '/users', httpMethod: 'GET' },
        },
      },
    },
  },
};

function App() {
  return (
    <DriverProvider backends={backends}>
      <ProductList />
      <UserList />
    </DriverProvider>
  );
}
```

### Automatic Routing

`useScrewQuery('product', 'list')` searches for the `product` screw across all backends and routes to the correct client automatically.

```tsx
// Automatic routing (by screw name)
const { data: products } = useScrewQuery('product', 'list');
const { data: users } = useScrewQuery('user', 'list');

// Explicit routing
const { data } = useScrewQuery('product', 'list', { backend: 'products' });
```

### Isolation

Each backend has its own cache, its own metrics, and its own events. Data from one backend never leaks into another.

### Mix legacy + backends

```tsx
<DriverProvider
  apiInstance={defaultApi}
  screws={{ legacy: { name: 'legacy', methods: { ... } } }}
  backends={{
    billing: { apiInstance: billingApi, screws: { invoice: { ... } } },
  }}
/>
```

---

## 3. OpenAPI Generation

reactscrew can generate complete screws, TypeScript hooks, types, and validators from an OpenAPI 3.0/3.1 file.

### Exposed API (browser-safe)

These functions are exported from the main barrel:

```ts
import {
  parseOpenApiDocument,          // Parse an OpenAPI document → contract
  validateOpenApiContract,       // Validate the parsed contract
  generateScrewsFromOpenApiContract,  // Generate screw definitions (string)
  generateOpenApiArtifacts,      // Generate all artifacts (types, hooks, validators, errors, screws)
  generateOpenApiArtifactsFromDocument, // Direct version (no file)
  loadOpenApiContract,           // (Node.js) Load a file or URL
} from 'reactscrew';
```

### Generation from a file (Node.js)

```bash
npx reactscrew-openapi openapi.json ./output
```

Produces 9 files:

```
output/
├── index.ts
├── custom/index.ts          ← preserved on regeneration
├── wrappers/index.ts        ← preserved on regeneration
└── generated/
    ├── index.ts
    ├── types/index.ts       ← TypeScript interfaces
    ├── errors/index.ts      ← documented error catalog
    ├── validators/index.ts  ← runtime validators
    ├── screws/index.ts      ← screw definitions
    └── hooks/index.ts       ← typed hooks (useXQuery, useXMutation)
```

### Example e-commerce spec

```json
{
  "openapi": "3.0.0",
  "info": { "title": "Products API", "version": "1.0.0" },
  "paths": {
    "/products": {
      "get": {
        "operationId": "listProducts",
        "parameters": [
          { "name": "category", "in": "query", "schema": { "type": "string" } }
        ],
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Product" } }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Product": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "title": { "type": "string" },
          "price": { "type": "number" }
        }
      }
    }
  }
}
```

Generates:

```tsx
// screws
const productsScrew = {
  name: "products",
  methods: {
    listProducts: {
      type: 'query',
      route: (params) => `/products?category=${params.category}`,
      httpMethod: 'GET',
      paramsValidator: validateListProductsParamsArgs,
      responseValidator: validateListProductsResponse,
    }
  }
};

// typed hook
const { data } = useListProductsQuery({ category: 'electronics' });
```

### Available e-commerce specs

The `examples/e-commerce/openapi/` directory contains 3 specs:

| File | Generated Screws | Endpoints |
|---------|----------------|-----------|
| `users.openapi.json` | `users`, `auth`, `wishlist` | 6 (CRUD users, login, wishlist) |
| `products.openapi.json` | `products`, `categories` | 5 (catalog, categories) |
| `orders.openapi.json` | `cart`, `orders` | 7 (cart, checkout, orders) |

Usage:

```bash
node scripts/generate-openapi-screws.mjs examples/e-commerce/openapi/products.openapi.json ./generated/products
```

---

## 4. Orchestration

reactscrew offers three orchestration levels: **batch**, **workflow**, and **progress tracking**.

### Batch — Parallel action execution

`executeBatch` runs a list of mutation actions (potentially across multiple backends) and reports progress.

```tsx
import { useScrewBatch } from 'reactscrew';

function CheckoutAll() {
  const { execute, progress, isExecuting } = useScrewBatch([
    { screwName: 'order', methodName: 'checkout', variables: { cartId: 1 }, backend: 'orders' },
    { screwName: 'inventory', methodName: 'reserve', variables: { productId: 5 }, backend: 'products' },
  ]);

  return (
    <button onClick={() => execute()} disabled={isExecuting}>
      {isExecuting ? `⏳ ${progress?.percentage}%` : '⚡ Order all'}
    </button>
  );
}
```

### Workflow — Sequential orchestration with dependencies

`executeWorkflow` runs steps with dependencies, retry, parallel mode, and conditional gating.

```tsx
import { executeWorkflow, useScrewWorkflow } from 'reactscrew';

function CheckoutWorkflow() {
  const { execute, progress } = useScrewWorkflow({
    steps: [
      { id: 'reserve',  screwName: 'inventory', methodName: 'reserve',  variables: { productId: 5 } },
      { id: 'payment',  screwName: 'billing',   methodName: 'charge',   variables: { amount: 99 }, dependsOn: ['reserve'] },
      { id: 'ship',     screwName: 'logistics', methodName: 'ship',     variables: { orderId: 1 },  dependsOn: ['payment'], retry: 2 },
      { id: 'notify',   screwName: 'notifications', methodName: 'email', variables: { userId: 1 },  dependsOn: ['ship'],   continueOnError: true },
    ],
  });

  return <button onClick={() => execute()}>🔁 Run workflow</button>;
}
```

#### Workflow-level conditions

A workflow can have a global `condition` evaluated before any step runs. When paired with `waitForCondition: true`, the workflow polls every 500ms and re-evaluates the condition until it passes (up to 30s).

```tsx
const result = await executeWorkflow({
  steps: [
    { id: 'checkout', screwName: 'orders', methodName: 'checkout', variables: { shippingAddress } },
    { id: 'tracking', screwName: 'delivery', methodName: 'track', args: [{ orderId: 0 }], dependsOn: ['checkout'] },
  ],
  condition: (ctx) => {
    const cart = ctx.getScrewData('cart', 'get');
    return cart?.items?.length >= (ctx.variables?.minItems ?? 1);
  },
  waitForCondition: true,
  variables: { minItems: 1 },
  onStepCondition: (result) => {
    if (!result.passed) console.log(`⏳ Waiting for "${result.stepId}"`);
  },
}, { client, resolveClient, onProgress });
```

- **`condition`** — receives `{ stepResults, getScrewData, variables }`. Return `true` to proceed.
- **`waitForCondition`** — if the condition returns `false`, the workflow re-polls.
- **`variables`** — arbitrary data injected into the condition context via `ctx.variables`.
- **`onStepCondition`** — callback when a step-level or workflow-level condition is evaluated.

#### Step-level conditions

Individual steps can also have conditions:

```tsx
{
  id: 'apply-discount',
  screwName: 'cart',
  methodName: 'applyCoupon',
  condition: (ctx) => ctx.stepResults['checkout']?.data?.couponApplied === true,
  waitForCondition: true,
}
```

#### Declarative workflows in screw definitions

Workflows can be declared directly in a `ScrewDefinition` and auto-executed:

```ts
const cartScrew: ScrewDefinition = {
  name: 'cart',
  methods: { get: { type: 'query', route: '/cart', httpMethod: 'GET' } },
  workflows: {
    checkout: {
      config: {
        steps: [
          { id: 'validate', screwName: 'cart', methodName: 'get', label: 'Stock check' },
          { id: 'checkout', screwName: 'orders', methodName: 'checkout', dependsOn: ['validate'] },
        ],
        condition: (ctx) => {
          const cart = ctx.getScrewData('cart', 'get');
          return cart?.items?.length > 0;
        },
        waitForCondition: true,
        variables: { minItems: 1 },
      },
      autoStart: false,
    },
  },
};
```

Use `useScrewAutoWorkflow` to execute a declared workflow by passing its config:

```tsx
const { start, progress, status } = useScrewAutoWorkflow({
  config: { steps, condition, waitForCondition, variables },
  onProgress: (snap) => setProgress(snap),
});
```

### Progress Tracking

`useScrewProgress` derives a unified `ProgressSnapshot` from any batch or workflow source:

```tsx
import { useScrewBatch, useScrewProgress } from 'reactscrew';

function ProgressBar() {
  const batch = useScrewBatch([...]);
  const progress = useScrewProgress(batch);

  if (!progress || progress.phase === 'idle') return null;

  return (
    <div>
      <progress value={progress.percentage} max={100} />
      <span>{progress.percentage}% · {progress.itemsProcessed}/{progress.itemsTotal}</span>
    </div>
  );
}
```

---

## SSR / Server Components

All hooks and `DriverProvider` are marked `'use client'`. They are safe for use in Next.js App Router client boundaries.

**SSR data prefetching** uses `createReactScrewClient` (exported from the package):

```tsx
// app/page.tsx — Server Component
import { createFetchAdapter, createReactScrewClient } from 'reactscrew';
import { userScrew } from '../screws/user';

export default async function Page() {
  const client = createReactScrewClient(api, { user: userScrew });
  await client.prefetchQuery('user', 'list');
  const dehydratedState = client.dehydrate();

  return <UsersClient dehydratedState={dehydratedState} />;
}
```

```tsx
// app/users-client.tsx — Client Component
'use client';
import { DriverProvider, useScrewQuery } from 'reactscrew';

export default function UsersClient({ dehydratedState }) {
  return (
    <DriverProvider apiInstance={api} screws={{ user: userScrew }}
      dehydratedState={dehydratedState}>
      <UsersList />
    </DriverProvider>
  );
}
```

**Limits:**
- Hooks are client-only (`'use client'` boundary). No RSC-specific exports.
- Cache persistence (`persist` option) uses `localforage` (IndexedDB). Do not enable in SSR; it will be safely ignored.
- `createReactScrewClient` is pure and safe for server usage; use for prefetch in Server Components or Route Handlers.

---

## Documentation

| Topic | Resource |
|-------|----------|
| Execution roadmap | [TASK.md](./TASK.md) |
| Vision & levels | [evolving.md](./evolving.md) |
| **Full API reference** | [API_REFERENCE.md](./API_REFERENCE.md) — every hook, component, function, and type |
| **Best practices** | [BEST_PRACTICES.md](./BEST_PRACTICES.md) — cache strategy, configuration values, pitfalls |
| TypeScript types | [src/index.ts](./src/index.ts) (JSDoc per export) |
| Multi-backend e-commerce demo | [examples/e-commerce](./examples/e-commerce) |
| OpenAPI 3.0 specs | [examples/e-commerce/openapi/](./examples/e-commerce/openapi) |
| Generated artifacts | [examples/e-commerce/generated/](./examples/e-commerce/generated) |
| Examples | [examples/basic](./examples/basic), [examples/openapi-generated](./examples/openapi-generated), [examples/next-app-router](./examples/next-app-router) |

## Performance

Benchmarks measured on **Node.js v22.22.0, Linux**, against a local loopback HTTP server (~2ms network latency per request). All figures are the average of 30–500 iterations.

| Benchmark | avg | p50 | p95 |
|---|---|---|---|
| **Cold query** (first fetch, ~2ms network) | 5.24 ms | 3.63 ms | 8.58 ms |
| **Warm query** (from cache) | 3.28 ms | 3.25 ms | 3.81 ms |
| **Cold slow query** (~30ms network) | 31.22 ms | 31.24 ms | 31.72 ms |
| **Mutation** execution | 3.69 ms | 3.55 ms | 4.32 ms |
| **Concurrent dedup** (5 identical requests, 1 network call) | 3.35 ms | — | — |
| **Batch** (5 items, parallel) | 0.42 ms | — | — |
| **Workflow** (3 sequential steps) | 0.21 ms | — | — |
| **OpenAPI parse** (15-endpoint document) | 0.18 ms | 0.14 ms | 0.23 ms |
| **Logger.info** (enabled, JSON output) | 0.037 ms | 0.022 ms | 0.030 ms |
| **Logger.debug** (filtered by log level, ~0 cost) | 0.001 ms | — | — |

**Bundle size:** `dist/`=616 KB (38 files), gzipped=62.7 KB. Barrel re-export: 6.9 KB. Tree-shaking eliminates unused modules.

**Cache overhead:** ~0.5 KB per cache entry (based on 500 entries). Concurrent dedup routes identical requests through a single network call — subsequent subscribers await the same in-flight promise.

## Scripts

```bash
npm run typecheck   # TypeScript strict check
npm run test        # Vitest (136 tests)
npm run lint        # ESLint
npm run build       # tsc → dist/
npm run demo        # Webpack dev server (e-commerce demo)
DEMO=basic npm run demo  # Basic demo alternative
```
