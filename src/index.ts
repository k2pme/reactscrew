/**
 * reactscrew — Public API contract.
 *
 * ## Runtime exports
 * - DriverProvider    — React context provider that wires screws, transport, and cache.
 * - ReactScrewError   — Normalised error class (code, status, message, description, details, retryable, uiHint).
 * - useScrew           — Legacy hook (generic, single-screw). Prefer useScrewQuery / useScrewMutation.
 * - useScrewQuery      — Typed query hook with cache, invalidation, and selector support.
 * - useScrewMutation   — Typed mutation hook with optimistic updates and rollback.
 * - useScrewClient     — Low-level client accessor.
 * - useInfiniteScrewQuery — Paginated/cursor-based query hook.
 * - useScrewDevtools   — Devtools snapshot hook (queries, mutations, metrics, events).
 * - useScrewEvents     — Request lifecycle event subscription hook.
 * - createFetchAdapter — Transport adapter using the Fetch API.
 * - createAxiosAdapter — Transport adapter wrapping an Axios-like instance.
 * - withAuthStrategy   — Higher-order transport that injects tokens and handles refresh.
 *
 * ## OpenAPI generation (pure, browser-safe)
 * - parseOpenApiDocument / validateOpenApiContract
 * - generateScrewsFromOpenApiContract / generateScrewsFromOpenApiDocument
 * - generateOpenApiArtifacts / generateOpenApiArtifactsFromDocument
 *
 * ## File-based generation (Node.js only, import from "reactscrew/generation/openapi")
 * - loadOpenApiContract / generateOpenApiArtifactsFromFile / generateScrewsFromOpenApiFile
 */

export { DriverProvider } from './components/DriverProvider';
export { ReactScrewError } from './errors';
export {
  createParameterSchema,
  createSchemaValidator,
  validateValueAgainstSchema
} from './validation/openapi';
export { useScrew } from './hooks/useScrew';
export { useScrewClient } from './hooks/useScrewClient';
export { useInfiniteScrewQuery } from './hooks/useInfiniteScrewQuery';
export { useScrewMutation } from './hooks/useScrewMutation';
export { useScrewDevtools } from './hooks/useScrewDevtools';
export { useScrewEvents } from './hooks/useScrewEvents';
export { useScrewQuery } from './hooks/useScrewQuery';
export { createAxiosAdapter, createFetchAdapter } from './transport/adapters';
export { withAuthStrategy } from './transport/auth';
export {
  generateOpenApiArtifacts,
  generateOpenApiArtifactsFromDocument,
  generateScrewsFromOpenApiContract,
  generateScrewsFromOpenApiDocument,
  parseOpenApiDocument,
  validateOpenApiContract
} from './generation/openapi';

export type {
  OpenApiDocument,
  OpenApiParameterObject,
  OpenApiPathItemObject,
  OpenApiRequestBodyObject,
  OpenApiResponseObject,
  OpenApiSchemaObject,
  GeneratedOpenApiArtifacts,
  OpenApiValidationResult,
  ParsedErrorContract,
  ParsedOpenApiContract,
  ParsedOperationContract,
  ParsedRequestBodyContract,
  ParsedSchemaContract
} from './generation/openapi';

export type {
  ApiInstance,
  ApiRequestConfig,
  ApiResponse,
  AuthStrategy,
  ClientMetrics,
  DocumentedErrorDefinition,
  DriverProviderProps,
  DehydratedState,
  HttpMethod,
  InfiniteQueryObserverOptions,
  LegacyUseScrewResult,
  MutationDefinition,
  MutationSnapshot,
  MutationState,
  PersistedCacheConfig,
  QueryDefinition,
  QueryInvalidationTarget,
  QueryKey,
  QueryObserverOptions,
  QuerySnapshot,
  QueryState,
  ReactScrewClient,
  ReactScrewClientOptions,
  ReactScrewErrorShape,
  RequestEvent,
  RollbackAction,
  RuntimeValidator,
  ScrewDefinition,
  ScrewMethodDefinition,
  ScrewsMap,
  UseInfiniteScrewQueryResult,
  UseScrewMutationOptions,
  UseScrewMutationResult,
  UseScrewQueryResult
} from './types';
