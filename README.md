# ReactScrew

`reactscrew` is a React data layer built around domain modules called `screws`.

It now exposes three levels of API:

- legacy compatibility with `useScrew`
- explicit `useScrewQuery` / `useScrewMutation`
- mature features such as hydration, infinite queries, devtools snapshots, event observers and OpenAPI generation

## Core Features

- Query and mutation hooks with deterministic `queryKey`
- In-memory cache with invalidation and request deduplication
- Fine-grained subscriptions via `useSyncExternalStore`
- Optional cache persistence with versioned storage
- SSR/SSG hydration through `dehydrate` / `hydrate`
- Infinite query support
- Structured request events and devtools snapshots
- Transport adapters for `fetch` and `axios`
- Auth retry strategy for 401 refresh flows
- OpenAPI screw generation

## Installation

```bash
npm install reactscrew
```

`react` and `react-dom` are peer dependencies.

## Quick Start

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { DriverProvider, createFetchAdapter, useScrewQuery } from 'reactscrew';

const api = createFetchAdapter('https://jsonplaceholder.typicode.com');

const userScrew = {
  name: 'user',
  executeOnLaunch: true,
  methods: {
    list: {
      type: 'query',
      route: '/users',
      httpMethod: 'GET'
    },
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

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

createRoot(document.getElementById('root')).render(
  <DriverProvider
    apiInstance={api}
    screws={{ user: userScrew }}
    clientOptions={{
      persist: { version: 'v1' }
    }}
  >
    <App />
  </DriverProvider>
);
```

## Query API

```jsx
import { useScrewQuery, useScrewMutation } from 'reactscrew';

const query = useScrewQuery('user', 'list', {
  staleTime: 60_000
});

const mutation = useScrewMutation('user', 'create', {
  optimisticUpdate: ({ client, variables }) => {
    const previous = client.getQueryData(['user', 'list']);
    client.setQueryData(['user', 'list'], (current) => [...(current ?? []), variables]);

    return {
      rollback: () => client.setQueryData(['user', 'list'], previous ?? [])
    };
  }
});
```

## Hydration

```tsx
import { DriverProvider } from 'reactscrew';

<DriverProvider
  apiInstance={api}
  screws={screws}
  dehydratedState={serverDehydratedState}
  clientOptions={{ persist: { version: 'v2' } }}
>
  <App />
</DriverProvider>;
```

Use `useScrewClient()` to access:

- `dehydrate()`
- `hydrate(state)`
- `persistCache()`
- `restorePersistedCache()`

## Infinite Queries

```tsx
import { useInfiniteScrewQuery } from 'reactscrew';

const posts = useInfiniteScrewQuery('post', 'list', {
  initialPageParam: 1,
  getNextPageParam: (_lastPage, _pages, lastPageParam) =>
    lastPageParam < 10 ? lastPageParam + 1 : undefined
});
```

## Observability and Devtools

Use `useScrewEvents` for streaming request events and `useScrewDevtools` for current snapshots:

```tsx
import { useScrewDevtools, useScrewEvents } from 'reactscrew';

useScrewEvents((event) => {
  console.log(event.type, event.screwName, event.methodName);
});

const devtools = useScrewDevtools();
console.log(devtools.metrics, devtools.queries, devtools.mutations);
```

## Auth Strategy

```ts
import { createFetchAdapter, withAuthStrategy } from 'reactscrew';

const api = withAuthStrategy(createFetchAdapter('https://api.example.com'), {
  getAccessToken: async () => localStorage.getItem('token'),
  refreshAccessToken: async () => {
    const nextToken = 'new-token';
    localStorage.setItem('token', nextToken);
    return nextToken;
  }
});
```

## OpenAPI Generation

Programmatic API:

```ts
import {
  generateOpenApiArtifacts,
  generateOpenApiArtifactsFromFile,
  generateScrewsFromOpenApiContract,
  generateScrewsFromOpenApiDocument,
  loadOpenApiContract,
  parseOpenApiDocument,
  validateOpenApiContract
} from 'reactscrew';
```

CLI:

```bash
npm run build
npm run generate:openapi -- ./openapi.json ./generated
npm run inspect:openapi -- ./openapi.json
npm run validate:openapi -- ./openapi.json
```

Generated artifacts now include:
- `generated/screws`
- `generated/hooks`
- `generated/types`
- `generated/validators`
- `generated/errors`

Level 3 contract runtime features:
- automatic params/body/response validators from OpenAPI schemas
- documented error catalogs with `code`, `status`, `description`, `retryable` and `uiHint`
- runtime error normalization through `ReactScrewError`

Generation strategy notes are in [docs/generation-strategy.md](/home/clodlin/reactscrew/docs/generation-strategy.md).

## Examples

- Basic example: [examples/basic](/home/clodlin/reactscrew/examples/basic)
- Next.js App Router example: [examples/next-app-router](/home/clodlin/reactscrew/examples/next-app-router)
- Vite example: [examples/vite](/home/clodlin/reactscrew/examples/vite)

## Scripts

```bash
npm run typecheck
npm run test
npm run build
npm run generate:openapi -- ./openapi.json ./generated
```

## Current Limits

- No visual devtools panel yet, only programmatic snapshots/hooks
- OpenAPI generation now creates a stable `generated/` structure and preserves `custom/` and `wrappers/`
- Server Components are supported at the hydration boundary, not as a direct hook runtime

## Roadmap

Execution phases are tracked in [TASK.md](/home/clodlin/reactscrew/TASK.md).
