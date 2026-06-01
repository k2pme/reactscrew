import { describe, expectTypeOf, it } from 'vitest';
import {
  DriverProvider,
  ReactScrewError,
  useScrew,
  useScrewQuery,
  useScrewMutation,
  useScrewClient,
  useInfiniteScrewQuery,
  useScrewDevtools,
  useScrewEvents,
  createFetchAdapter,
  createAxiosAdapter,
  withAuthStrategy,
  parseOpenApiDocument,
  validateOpenApiContract,
  generateOpenApiArtifacts,
  type ApiInstance,
  type ApiRequestConfig,
  type ApiResponse,
  type QueryDefinition,
  type MutationDefinition,
  type ScrewDefinition,
  type ScrewsMap,
  type QueryKey,
  type QueryState,
  type MutationState,
  type QueryObserverOptions,
  type UseScrewQueryResult,
  type UseScrewMutationResult,
  type UseInfiniteScrewQueryResult,
  type InfiniteQueryObserverOptions,
  type ReactScrewErrorShape,
  type DocumentedErrorDefinition,
  type ReactScrewClient,
  type HttpMethod,
  type ScrewMethodDefinition,
  type ScrewsMap as ScrewsMapAlias,
  type DehydratedState,
  type RuntimeValidator,
  type RollbackAction,
  type AuthStrategy,
  type OpenApiDocument,
  type OpenApiValidationResult,
  type ParsedOpenApiContract
} from '../src';

describe('Public API types', () => {
  it('exposes ReactScrewErrorShape with correct shape', () => {
    const error = new ReactScrewError('test', { code: 'TEST' });
    expectTypeOf(error).toMatchTypeOf<ReactScrewErrorShape>();
    expectTypeOf(error.code).toBeString();
    expectTypeOf(error.status).toBeNullable();
    expectTypeOf(error.retryable).toBeNullable();
    expectTypeOf(error.description).toBeNullable();
    expectTypeOf(error.details).toBeNullable();
  });

  it('exposes DriverProvider with correct props', () => {
    expectTypeOf(DriverProvider).toBeFunction();
  });

  it('exposes hooks as functions', () => {
    expectTypeOf(useScrew).toBeFunction();
    expectTypeOf(useScrewQuery).toBeFunction();
    expectTypeOf(useScrewMutation).toBeFunction();
    expectTypeOf(useScrewClient).toBeFunction();
    expectTypeOf(useInfiniteScrewQuery).toBeFunction();
    expectTypeOf(useScrewDevtools).toBeFunction();
    expectTypeOf(useScrewEvents).toBeFunction();
  });

  it('exposes transport adapters as functions', () => {
    expectTypeOf(createFetchAdapter).toBeFunction();
    expectTypeOf(createAxiosAdapter).toBeFunction();
    expectTypeOf(withAuthStrategy).toBeFunction();
  });

  it('exposes OpenAPI utilities as functions', () => {
    expectTypeOf(parseOpenApiDocument).toBeFunction();
    expectTypeOf(validateOpenApiContract).toBeFunction();
    expectTypeOf(generateOpenApiArtifacts).toBeFunction();
  });
});

describe('TypeScript structural types', () => {
  it('HttpMethod is a union of HTTP verbs', () => {
    const get: HttpMethod = 'GET';
    const post: HttpMethod = 'POST';
    const put: HttpMethod = 'PUT';
    const patch: HttpMethod = 'PATCH';
    const del: HttpMethod = 'DELETE';
    expectTypeOf(get).toEqualTypeOf<'GET'>();
    expectTypeOf(post).toEqualTypeOf<'POST'>();
    expectTypeOf(put).toEqualTypeOf<'PUT'>();
    expectTypeOf(patch).toEqualTypeOf<'PATCH'>();
    expectTypeOf(del).toEqualTypeOf<'DELETE'>();
  });

  it('QueryKey is assignable to readonly unknown[]', () => {
    expectTypeOf<QueryKey>().toMatchTypeOf<readonly unknown[]>();
  });

  it('QueryObserverOptions supports common options', () => {
    expectTypeOf<QueryObserverOptions>().toHaveProperty('enabled');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('select');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('initialData');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('placeholderData');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('staleTime');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('cacheTime');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('refetchOnWindowFocus');
    expectTypeOf<QueryObserverOptions>().toHaveProperty('refetchOnReconnect');
  });

  it('QueryState has correct status fields', () => {
    expectTypeOf<QueryState>().toHaveProperty('status');
    expectTypeOf<QueryState>().toHaveProperty('data');
    expectTypeOf<QueryState>().toHaveProperty('error');
    expectTypeOf<QueryState>().toHaveProperty('isLoading');
    expectTypeOf<QueryState>().toHaveProperty('isFetching');
    expectTypeOf<QueryState>().toHaveProperty('isRefetching');
    expectTypeOf<QueryState>().toHaveProperty('updatedAt');
  });

  it('MutationState has correct status fields', () => {
    expectTypeOf<MutationState>().toHaveProperty('status');
    expectTypeOf<MutationState>().toHaveProperty('data');
    expectTypeOf<MutationState>().toHaveProperty('error');
    expectTypeOf<MutationState>().toHaveProperty('isPending');
  });
});

describe('Generic type inference', () => {
  it('UseScrewQueryResult infers data type from generic', () => {
    type Result = UseScrewQueryResult<string>;
    expectTypeOf<Result>().toHaveProperty('data');
  });

  it('UseScrewMutationResult infers data and variables types', () => {
    type Result = UseScrewMutationResult<string, { name: string }>;
    expectTypeOf<Result>().toHaveProperty('mutate');
  });

  it('QueryDefinition supports typed params and response', () => {
    type Def = QueryDefinition<[id: string], { id: string; name: string }>;
    expectTypeOf<Def>().toHaveProperty('route');
    expectTypeOf<Def>().toHaveProperty('httpMethod');
    expectTypeOf<Def>().toHaveProperty('queryKey');
  });

  it('MutationDefinition supports typed params, body, and response', () => {
    type Def = MutationDefinition<[id: string], { ok: boolean }, { name: string }>;
    expectTypeOf<Def>().toHaveProperty('route');
    expectTypeOf<Def>().toHaveProperty('httpMethod');
    expectTypeOf<Def>().toHaveProperty('bodyValidator');
    expectTypeOf<Def>().toHaveProperty('optimisticUpdate');
    expectTypeOf<Def>().toHaveProperty('invalidateQueries');
  });

  it('ScrewMethodDefinition accepts both query and mutation', () => {
    const queryMethod: ScrewMethodDefinition = { route: '/test', httpMethod: 'GET' };
    const mutationMethod: ScrewMethodDefinition = { route: '/test', httpMethod: 'POST' };
    expectTypeOf(queryMethod).toMatchTypeOf<ScrewMethodDefinition>();
    expectTypeOf(mutationMethod).toMatchTypeOf<ScrewMethodDefinition>();
  });
});

describe('Error types', () => {
  it('ReactScrewErrorShape extends Error', () => {
    expectTypeOf<ReactScrewErrorShape>().toHaveProperty('message');
    expectTypeOf<ReactScrewErrorShape>().toHaveProperty('name');
    expectTypeOf<ReactScrewErrorShape>().toHaveProperty('stack');
  });

  it('DocumentedErrorDefinition has optional fields', () => {
    expectTypeOf<DocumentedErrorDefinition>().toHaveProperty('code');
    expectTypeOf<DocumentedErrorDefinition>().toHaveProperty('status');
    expectTypeOf<DocumentedErrorDefinition>().toHaveProperty('message');
    expectTypeOf<DocumentedErrorDefinition>().toHaveProperty('description');
    expectTypeOf<DocumentedErrorDefinition>().toHaveProperty('retryable');
  });
});

describe('Client types', () => {
  it('ReactScrewClient has cache and query methods', () => {
    const client = {} as ReactScrewClient;
    expectTypeOf(client.getQueryData).toBeFunction();
    expectTypeOf(client.setQueryData).toBeFunction();
    expectTypeOf(client.invalidateQueries).toBeFunction();
    expectTypeOf(client.fetchQuery).toBeFunction();
    expectTypeOf(client.prefetchQuery).toBeFunction();
    expectTypeOf(client.executeMutation).toBeFunction();
    expectTypeOf(client.dehydrate).toBeFunction();
    expectTypeOf(client.hydrate).toBeFunction();
    expectTypeOf(client.persistCache).toBeFunction();
    expectTypeOf(client.getMetrics).toBeFunction();
  });

  it('ApiInstance has correct signature', () => {
    expectTypeOf<ApiInstance>().toBeFunction();
  });

  it('ApiRequestConfig has method, url, and optional data/signal', () => {
    expectTypeOf<ApiRequestConfig>().toHaveProperty('method');
    expectTypeOf<ApiRequestConfig>().toHaveProperty('url');
    expectTypeOf<ApiRequestConfig>().toHaveProperty('data');
    expectTypeOf<ApiRequestConfig>().toHaveProperty('signal');
  });

  it('ApiResponse has data, status, and optional headers', () => {
    expectTypeOf<ApiResponse>().toHaveProperty('data');
    expectTypeOf<ApiResponse>().toHaveProperty('status');
  });
});

describe('RuntimeValidator type', () => {
  it('accepts a function returning value or void', () => {
    const v1: RuntimeValidator<string> = (x: string) => x;
    const v2: RuntimeValidator<number> = (_x: number) => undefined;
    expectTypeOf(v1).toBeFunction();
    expectTypeOf(v2).toBeFunction();
  });
});

describe('ScrewDefinition and ScrewsMap', () => {
  it('ScrewDefinition has name and methods', () => {
    expectTypeOf<ScrewDefinition>().toHaveProperty('name');
    expectTypeOf<ScrewDefinition>().toHaveProperty('methods');
  });

  it('ScrewsMap is a record of screw definitions', () => {
    const map: ScrewsMap = {
      users: {
        name: 'users',
        methods: {
          list: { route: '/users', httpMethod: 'GET' }
        }
      }
    };
    expectTypeOf(map).toMatchTypeOf<ScrewsMapAlias>();
  });
});

describe('OpenAPI types', () => {
  it('OpenApiDocument has paths and info', () => {
    expectTypeOf<OpenApiDocument>().toHaveProperty('openapi');
    expectTypeOf<OpenApiDocument>().toHaveProperty('info');
    expectTypeOf<OpenApiDocument>().toHaveProperty('paths');
  });

  it('ParsedOpenApiContract has operations and schemas', () => {
    expectTypeOf<ParsedOpenApiContract>().toHaveProperty('source');
    expectTypeOf<ParsedOpenApiContract>().toHaveProperty('operations');
    expectTypeOf<ParsedOpenApiContract>().toHaveProperty('schemas');
  });

  it('OpenApiValidationResult has valid flag and errors', () => {
    expectTypeOf<OpenApiValidationResult>().toHaveProperty('valid');
    expectTypeOf<OpenApiValidationResult>().toHaveProperty('errors');
  });
});

describe('Advanced types', () => {
  it('InfiniteQueryObserverOptions requires initialPageParam and getNextPageParam', () => {
    expectTypeOf<InfiniteQueryObserverOptions>().toHaveProperty('initialPageParam');
    expectTypeOf<InfiniteQueryObserverOptions>().toHaveProperty('getNextPageParam');
  });

  it('UseInfiniteScrewQueryResult has fetchNextPage and hasNextPage', () => {
    expectTypeOf<UseInfiniteScrewQueryResult>().toHaveProperty('fetchNextPage');
    expectTypeOf<UseInfiniteScrewQueryResult>().toHaveProperty('hasNextPage');
    expectTypeOf<UseInfiniteScrewQueryResult>().toHaveProperty('pageParams');
  });

  it('DehydratedState has queries, mutations, and meta', () => {
    expectTypeOf<DehydratedState>().toHaveProperty('queries');
    expectTypeOf<DehydratedState>().toHaveProperty('mutations');
    expectTypeOf<DehydratedState>().toHaveProperty('meta');
  });

  it('AuthStrategy has optional token handlers', () => {
    expectTypeOf<AuthStrategy>().toHaveProperty('getAccessToken');
    expectTypeOf<AuthStrategy>().toHaveProperty('refreshAccessToken');
    expectTypeOf<AuthStrategy>().toHaveProperty('onAuthFailure');
  });

  it('RollbackAction has a rollback function', () => {
    expectTypeOf<RollbackAction>().toHaveProperty('rollback');
  });
});
