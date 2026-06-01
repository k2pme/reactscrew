/**
 * reactscrew — Public API contract.
 *
 * ## Runtime exports
 * - DriverProvider       — React context provider that wires screws, transport, and cache.
 * - ReactScrewError      — Normalised error class (code, status, message, description, details, retryable, uiHint).
 * - useScrew             — Legacy hook (generic, single-screw). Prefer useScrewQuery / useScrewMutation.
 * - useScrewQuery        — Typed query hook with cache, invalidation, and selector support.
 * - useScrewMutation     — Typed mutation hook with optimistic updates and rollback.
 * - useScrewClient       — Low-level client accessor.
 * - useInfiniteScrewQuery  — Paginated/cursor-based query hook.
 * - useScrewDevtools     — Devtools snapshot hook (queries, mutations, metrics, events).
 * - useScrewEvents       — Request lifecycle event subscription hook.
 * - createFetchAdapter   — Transport adapter using the Fetch API.
 * - createAxiosAdapter   — Transport adapter wrapping an Axios-like instance.
 * - withAuthStrategy     — Higher-order transport that injects tokens and handles refresh.
 * - createProxyAdapter   — Transport wrapper that rewrites/maps backend URLs.
 * - createReactScrewClient — Creates a client instance (useful for SSR prefetch).
 *
 * ## UX feedback (Level 4)
 * - FeedbackProvider     — Wires toasts, loaders, and event-driven UX feedback.
 * - ToastProvider        — Customizable toast notification system.
 * - useScrewToast        — Hook to add/remove toasts programmatically.
 * - LoaderProvider       — Customizable per-request loading indicators.
 * - useScrewLoader       — Hook to show/hide loaders programmatically.
 * - useScrewFeedback     — Combined hook for toasts, loaders, success/error feedback.
 *
 * ## Observability (MATURE-2)
 * - ScrewDevtools       — Visual devtools panel component (React).
 * - createScrewLogger   — Structured logger with levels and formats.
 * - withSentry          — Sentry integration (breadcrumbs + error capture).
 * - withOpenTelemetry   — OpenTelemetry tracing integration.
 *
 * ## Orchestration (Level 5) — Batch, workflow, progress
 * - useScrewBatch        — Execute homogeneous or heterogeneous batch operations.
 * - useScrewWorkflow     — Orchestrate multi-step workflows with deps, retry, parallelism.
 * - useScrewProgress     — Derive a ProgressSnapshot from a batch or workflow source.
 * - executeBatch         — Pure batch runner (usable outside React).
 * - executeWorkflow      — Pure workflow runner (usable outside React).
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
export { createReactScrewClient } from './client/ReactScrewClient';
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
export { createProxyAdapter } from './transport/proxy';
export type { ProxyRule, ProxyUrlResolver } from './transport/proxy';
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

export {
  FeedbackProvider,
  ToastProvider,
  useScrewToast,
  LoaderProvider,
  useScrewLoader,
  useScrewFeedback
} from './feedback';
export type {
  Toast,
  ToastVariant,
  ToastConfig,
  ToastErrorMapping,
  LoaderVariant,
  LoaderPolicy,
  LoaderState,
  FeedbackConfig
} from './feedback';

export { ScrewDevtools } from './components/ScrewDevtools';
export { createScrewLogger, defaultLogger, withSentry, withOpenTelemetry } from './observability';
export type { ScrewLogger, LoggerConfig, LogLevel, LogFormat, SentryLikeInstance, OTelTracerLike, OTelSpanLike } from './observability';

export { useScrewBatch } from './hooks/useScrewBatch';
export type { UseScrewBatchOptions, UseScrewBatchReturn } from './hooks/useScrewBatch';
export { useScrewWorkflow } from './hooks/useScrewWorkflow';
export type { UseScrewWorkflowOptions, UseScrewWorkflowReturn } from './hooks/useScrewWorkflow';
export { useScrewProgress } from './hooks/useScrewProgress';
export type { UseScrewProgressSource } from './hooks/useScrewProgress';
export { executeBatch, executeWorkflow } from './orchestration';
export type {
  BatchAction,
  BatchResult,
  BatchStepError,
  BatchSummary,
  ExecutionContext,
  ProgressSnapshot,
  StepResult,
  StepStatus,
  WorkflowConfig,
  WorkflowStep
} from './orchestration';

export type {
  ApiInstance,
  ApiRequestConfig,
  ApiResponse,
  AuthStrategy,
  BackendConfig,
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
