# Examples

This folder illustrates the main usage patterns of `reactscrew`.

## Available Examples

### `basic`

Purpose:
- legacy compatibility with `useScrew`
- startup loading with `executeOnLaunch`
- mutation through `executeMethod`

Files:
- [basic/App.jsx](/home/clodlin/reactscrew/examples/basic/App.jsx)
- [basic/index.jsx](/home/clodlin/reactscrew/examples/basic/index.jsx)

### `vite`

Purpose:
- explicit query and mutation hooks
- invalidation
- events and devtools snapshots
- versioned cache persistence

Files:
- [vite/App.jsx](/home/clodlin/reactscrew/examples/vite/App.jsx)
- [vite/main.jsx](/home/clodlin/reactscrew/examples/vite/main.jsx)

### `next-app-router`

Purpose:
- framework integration with App Router
- hydration-ready provider setup
- client/server boundary example

Files:
- [next-app-router/app/page.tsx](/home/clodlin/reactscrew/examples/next-app-router/app/page.tsx)
- [next-app-router/app/users-client.tsx](/home/clodlin/reactscrew/examples/next-app-router/app/users-client.tsx)

### `hydration`

Purpose:
- SSR/SSG cache dehydration
- client hydration with `dehydratedState`
- no immediate refetch after hydration

Files:
- [hydration/server-state.js](/home/clodlin/reactscrew/examples/hydration/server-state.js)
- [hydration/client-entry.jsx](/home/clodlin/reactscrew/examples/hydration/client-entry.jsx)

### `infinite-query`

Purpose:
- paginated loading with `useInfiniteScrewQuery`
- page parameter progression
- accumulation of pages in cache

Files:
- [infinite-query/App.jsx](/home/clodlin/reactscrew/examples/infinite-query/App.jsx)
- [infinite-query/screws/post.js](/home/clodlin/reactscrew/examples/infinite-query/screws/post.js)

### `auth-refresh`

Purpose:
- authenticated transport
- automatic retry after `401`
- centralised access token refresh strategy

Files:
- [auth-refresh/api.js](/home/clodlin/reactscrew/examples/auth-refresh/api.js)
- [auth-refresh/App.jsx](/home/clodlin/reactscrew/examples/auth-refresh/App.jsx)

### `openapi-generated`

Purpose:
- API contract driven setup
- OpenAPI to screws generation
- generated layer + app layer separation

Files:
- [openapi-generated/openapi.json](/home/clodlin/reactscrew/examples/openapi-generated/openapi.json)
- [openapi-generated/generated/userScrews.js](/home/clodlin/reactscrew/examples/openapi-generated/generated/userScrews.js)
- [openapi-generated/App.jsx](/home/clodlin/reactscrew/examples/openapi-generated/App.jsx)

### `trading`

Purpose:
- multi-view trading dashboard
- timed batch refreshes with local market simulation
- workflow-driven alerts and optional client-side sound signal

Files:
- [trading/src/index.tsx](/home/clodlin/reactscrew/examples/trading/src/index.tsx)
- [trading/src/App.tsx](/home/clodlin/reactscrew/examples/trading/src/App.tsx)
- [trading/src/marketApi.ts](/home/clodlin/reactscrew/examples/trading/src/marketApi.ts)

### `stress-suite`

Purpose:
- single shell with header navigation across stress scenarios
- kanban batch actions, ops workflow remediation, backoffice bulk review
- more realistic multi-surface demo for exercising `reactscrew`

Files:
- [stress-suite/src/index.tsx](/home/clodlin/reactscrew/examples/stress-suite/src/index.tsx)
- [stress-suite/src/App.tsx](/home/clodlin/reactscrew/examples/stress-suite/src/App.tsx)
- [stress-suite/src/suiteApi.ts](/home/clodlin/reactscrew/examples/stress-suite/src/suiteApi.ts)

## Recommended Reading Order

1. `basic`
2. `vite`
3. `hydration`
4. `infinite-query`
5. `auth-refresh`
6. `openapi-generated`
7. `trading`
8. `stress-suite`
9. `next-app-router`
