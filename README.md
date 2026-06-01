# reactscrew

A typed React data layer built around domain modules called *screws*.

## Features

- **Typed hooks** — `useScrewQuery`, `useScrewMutation` with full generic inference
- **Cache** — In-memory cache with deduplication, invalidation, and versioned persistence
- **Infinite queries** — Cursor/page-based pagination out of the box
- **Hydration** — SSR/SSG via `dehydrate` / `hydrate`
- **Observability** — Request event stream and devtools snapshots
- **Transport adapters** — `fetch` and `axios`, with auth retry strategy
- **OpenAPI generation** — Generate screws, hooks, types, and validators from OpenAPI specs
- **Error contract** — Unified `ReactScrewError` with `code`, `status`, `retryable`, `uiHint`
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

## Documentation

| Topic | Resource |
|-------|----------|
| Execution roadmap | [TASK.md](./TASK.md) |
| TypeScript types | [src/index.ts](./src/index.ts) (JSDoc per export) |
| Examples | [examples/basic](./examples/basic), [examples/vite](./examples/vite), [examples/next-app-router](./examples/next-app-router) |

## Scripts

```bash
npm run typecheck   # TypeScript strict check
npm run test        # Vitest
npm run lint        # ESLint
npm run build       # tsc → dist/
```
