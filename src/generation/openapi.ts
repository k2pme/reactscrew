import fs from 'node:fs/promises';
import path from 'node:path';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

export interface OpenApiSchemaObject {
  type?: string;
  description?: string;
  properties?: Record<string, OpenApiSchemaObject>;
  items?: OpenApiSchemaObject;
  required?: string[];
  enum?: unknown[];
  allOf?: OpenApiSchemaObject[];
  oneOf?: OpenApiSchemaObject[];
  anyOf?: OpenApiSchemaObject[];
  additionalProperties?: boolean | OpenApiSchemaObject;
  $ref?: string;
}

export interface OpenApiParameterObject {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: OpenApiSchemaObject;
}

export interface OpenApiMediaTypeObject {
  schema?: OpenApiSchemaObject;
}

export interface OpenApiRequestBodyObject {
  description?: string;
  required?: boolean;
  content?: Record<string, OpenApiMediaTypeObject>;
}

export interface OpenApiResponseObject {
  description?: string;
  content?: Record<string, OpenApiMediaTypeObject>;
}

export interface OpenApiOperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: OpenApiParameterObject[];
  requestBody?: OpenApiRequestBodyObject;
  responses?: Record<string, OpenApiResponseObject>;
}

export interface OpenApiPathItemObject {
  parameters?: OpenApiParameterObject[];
  get?: OpenApiOperationObject;
  post?: OpenApiOperationObject;
  put?: OpenApiOperationObject;
  patch?: OpenApiOperationObject;
  delete?: OpenApiOperationObject;
}

export interface OpenApiDocument {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    version?: string;
    description?: string;
  };
  paths?: Record<string, OpenApiPathItemObject>;
  components?: {
    schemas?: Record<string, OpenApiSchemaObject>;
  };
}

export interface ParsedSchemaContract {
  name: string;
  description?: string;
  schema: OpenApiSchemaObject;
}

export interface ParsedErrorContract {
  status: string;
  description?: string;
  contentTypes: string[];
  schema?: OpenApiSchemaObject;
}

export interface ParsedRequestBodyContract {
  required: boolean;
  description?: string;
  contentTypes: string[];
  schema?: OpenApiSchemaObject;
}

export interface ParsedOperationContract {
  screwName: string;
  methodName: string;
  httpMethod: Uppercase<HttpMethod>;
  route: string;
  summary?: string;
  description?: string;
  parameters: OpenApiParameterObject[];
  requestBody?: ParsedRequestBodyContract;
  responses: Record<string, OpenApiResponseObject>;
  successResponses: ParsedErrorContract[];
  errorResponses: ParsedErrorContract[];
}

export interface ParsedOpenApiContract {
  source: string;
  title?: string;
  version?: string;
  description?: string;
  schemas: ParsedSchemaContract[];
  operations: ParsedOperationContract[];
}

export interface OpenApiValidationResult {
  valid: boolean;
  source: string;
  operationCount: number;
  schemaCount: number;
  errors: string[];
}

export interface GeneratedOpenApiArtifacts {
  contract: ParsedOpenApiContract;
  files: Record<string, string>;
}

const unique = <TValue>(values: TValue[]): TValue[] =>
  values.filter((value, index, array) => array.indexOf(value) === index);

const sanitizeName = (value: string): string =>
  value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, group: string) => group.toUpperCase())
    .replace(/^[A-Z]/, (match) => match.toLowerCase());

const pascalCase = (value: string): string => {
  const normalized = sanitizeName(value);
  return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : 'Unnamed';
};

const quote = (value: string): string => JSON.stringify(value);
const schemaLiteral = (schema?: OpenApiSchemaObject): string =>
  schema ? JSON.stringify(schema, null, 2) : 'undefined';

const refNameFromSchema = (schema?: OpenApiSchemaObject): string | null => {
  if (!schema?.$ref) {
    return null;
  }

  const parts = schema.$ref.split('/');
  return parts[parts.length - 1] || null;
};

const makeOperationName = (
  method: HttpMethod,
  route: string,
  operation?: OpenApiOperationObject
): string => {
  if (operation?.operationId) {
    return sanitizeName(operation.operationId);
  }

  const normalizedRoute = route
    .replace(/[{}]/g, '')
    .split('/')
    .filter(Boolean)
    .map((part) => sanitizeName(part))
    .join('');

  return sanitizeName(`${method}${normalizedRoute || 'root'}`);
};

const inferScrewName = (route: string): string => {
  const [firstSegment] = route.split('/').filter(Boolean);
  return sanitizeName(firstSegment || 'default');
};

const parseResponseContract = (
  status: string,
  response: OpenApiResponseObject
): ParsedErrorContract => {
  const contentTypes = Object.keys(response.content ?? {});
  const firstContentType = contentTypes[0];

  return {
    status,
    description: response.description,
    contentTypes,
    schema: firstContentType ? response.content?.[firstContentType]?.schema : undefined
  };
};

const parseRequestBodyContract = (
  requestBody: OpenApiRequestBodyObject
): ParsedRequestBodyContract => {
  const contentTypes = Object.keys(requestBody.content ?? {});
  const firstContentType = contentTypes[0];

  return {
    required: requestBody.required ?? false,
    description: requestBody.description,
    contentTypes,
    schema: firstContentType ? requestBody.content?.[firstContentType]?.schema : undefined
  };
};

const isErrorStatus = (status: string): boolean => {
  if (status === 'default') {
    return true;
  }

  const parsed = Number(status);
  return Number.isFinite(parsed) && parsed >= 400;
};

const parseOperations = (document: OpenApiDocument): ParsedOperationContract[] => {
  const paths = document.paths ?? {};

  return Object.entries(paths).flatMap(([route, pathItem]) =>
    HTTP_METHODS.flatMap((method) => {
      const operation = pathItem[method];

      if (!operation) {
        return [];
      }

      const parameters = [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])];
      const responses = operation.responses ?? {};
      const parsedResponses = Object.entries(responses).map(([status, response]) =>
        parseResponseContract(status, response)
      );

      return [
        {
          screwName: inferScrewName(route),
          methodName: makeOperationName(method, route, operation),
          httpMethod: method.toUpperCase() as Uppercase<HttpMethod>,
          route,
          summary: operation.summary,
          description: operation.description,
          parameters,
          requestBody: operation.requestBody
            ? parseRequestBodyContract(operation.requestBody)
            : undefined,
          responses,
          successResponses: parsedResponses.filter((response) => !isErrorStatus(response.status)),
          errorResponses: parsedResponses.filter((response) => isErrorStatus(response.status))
        }
      ];
    })
  );
};

const parseSchemas = (document: OpenApiDocument): ParsedSchemaContract[] =>
  Object.entries(document.components?.schemas ?? {}).map(([name, schema]) => ({
    name,
    description: schema.description,
    schema
  }));

const assertOpenApiDocument = (document: OpenApiDocument, source: string): void => {
  if (!document.paths || typeof document.paths !== 'object') {
    throw new Error(`Invalid OpenAPI document from "${source}": missing "paths".`);
  }
};

const readSourceAsText = async (source: string): Promise<string> => {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI document from "${source}" (${response.status}).`);
    }

    return response.text();
  }

  return fs.readFile(source, 'utf8');
};

const groupOperationsByScrew = (
  operations: ParsedOperationContract[]
): Map<string, ParsedOperationContract[]> => {
  const groups = new Map<string, ParsedOperationContract[]>();

  operations.forEach((operation) => {
    const current = groups.get(operation.screwName) ?? [];
    current.push(operation);
    groups.set(operation.screwName, current);
  });

  return groups;
};

const buildParamsShape = (
  parameters: OpenApiParameterObject[]
): { typeSource: string; hasMembers: boolean } => {
  if (parameters.length === 0) {
    return {
      typeSource: 'Record<string, never>',
      hasMembers: false
    };
  }

  const lines = parameters.map((parameter) => {
    const propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(parameter.name)
      ? parameter.name
      : quote(parameter.name);
    const optionalToken = parameter.required ? '' : '?';
    const propertyType = schemaToTypeSource(parameter.schema);
    return `${propertyName}${optionalToken}: ${propertyType};`;
  });

  return {
    hasMembers: true,
    typeSource: `{\n${lines.map((line) => `  ${line}`).join('\n')}\n}`
  };
};

const schemaToTypeSource = (schema?: OpenApiSchemaObject): string => {
  if (!schema) {
    return 'unknown';
  }

  const refName = refNameFromSchema(schema);
  if (refName) {
    return pascalCase(refName);
  }

  if (schema.enum && schema.enum.length > 0) {
    return schema.enum.map((value) => JSON.stringify(value)).join(' | ');
  }

  if (schema.oneOf && schema.oneOf.length > 0) {
    return schema.oneOf.map((item) => schemaToTypeSource(item)).join(' | ');
  }

  if (schema.anyOf && schema.anyOf.length > 0) {
    return schema.anyOf.map((item) => schemaToTypeSource(item)).join(' | ');
  }

  if (schema.allOf && schema.allOf.length > 0) {
    return schema.allOf.map((item) => schemaToTypeSource(item)).join(' & ');
  }

  switch (schema.type) {
    case 'string':
      return 'string';
    case 'integer':
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'array':
      return `Array<${schemaToTypeSource(schema.items)}>`;
    case 'object': {
      const properties = Object.entries(schema.properties ?? {});
      const required = new Set(schema.required ?? []);

      if (properties.length === 0) {
        if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
          return `Record<string, ${schemaToTypeSource(schema.additionalProperties)}>`;
        }

        return 'Record<string, unknown>';
      }

      const renderedProperties = properties.map(([name, propertySchema]) => {
        const propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : quote(name);
        const optionalToken = required.has(name) ? '' : '?';
        return `  ${propertyName}${optionalToken}: ${schemaToTypeSource(propertySchema)};`;
      });

      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        renderedProperties.push(
          `  [key: string]: ${schemaToTypeSource(schema.additionalProperties)};`
        );
      }

      return `{\n${renderedProperties.join('\n')}\n}`;
    }
    default:
      return 'unknown';
  }
};

const makeOperationTypeNames = (operation: ParsedOperationContract) => {
  const baseName = pascalCase(operation.methodName);

  return {
    params: `${baseName}Params`,
    body: `${baseName}Body`,
    response: `${baseName}Response`,
    error: `${baseName}Error`,
    hook: `${baseName}${operation.httpMethod === 'GET' ? 'Query' : 'Mutation'}`
  };
};

const buildParameterSchema = (operation: ParsedOperationContract): OpenApiSchemaObject => ({
  type: 'object',
  required: operation.parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name),
  properties: Object.fromEntries(
    operation.parameters.map((parameter) => [parameter.name, parameter.schema ?? { type: 'string' }])
  ),
  additionalProperties: false
});

const makeDocumentedErrorCode = (
  operation: ParsedOperationContract,
  status: string
): string => `${pascalCase(operation.methodName).toUpperCase()}_${status === 'default' ? 'DEFAULT' : status}`;

const inferUiHint = (status: string): string => {
  if (status === '401') {
    return 'auth';
  }

  if (status === '403') {
    return 'forbidden';
  }

  if (status === '404') {
    return 'not-found';
  }

  if (status === '409' || status === '422') {
    return 'form';
  }

  if (status === '429') {
    return 'rate-limit';
  }

  const numericStatus = Number(status);
  if (Number.isFinite(numericStatus) && numericStatus >= 500) {
    return 'retry';
  }

  return 'error';
};

const isRetryableStatus = (status: string): boolean => {
  const numericStatus = Number(status);
  return status === 'default' || numericStatus === 408 || numericStatus === 429 || numericStatus >= 500;
};

const getPrimarySuccessSchema = (
  operation: ParsedOperationContract
): OpenApiSchemaObject | undefined => operation.successResponses[0]?.schema;

const renderSchemaExport = (schema: ParsedSchemaContract): string => {
  const typeName = pascalCase(schema.name);
  const descriptionLine = schema.description ? `/** ${schema.description} */\n` : '';
  return `${descriptionLine}export type ${typeName} = ${schemaToTypeSource(schema.schema)};\n`;
};

const resolveSchemaReferences = (
  schema: OpenApiSchemaObject | undefined,
  contract: ParsedOpenApiContract,
  visitedRefs = new Set<string>()
): OpenApiSchemaObject | undefined => {
  if (!schema) {
    return undefined;
  }

  const refName = refNameFromSchema(schema);
  if (refName) {
    if (visitedRefs.has(refName)) {
      return {};
    }

    const target = contract.schemas.find((item) => item.name === refName)?.schema;
    if (!target) {
      return {};
    }

    const nextVisited = new Set(visitedRefs);
    nextVisited.add(refName);
    return resolveSchemaReferences(target, contract, nextVisited);
  }

  return {
    ...schema,
    properties: schema.properties
      ? Object.fromEntries(
          Object.entries(schema.properties).map(([key, value]) => [
            key,
            resolveSchemaReferences(value, contract, new Set(visitedRefs)) ?? {}
          ])
        )
      : undefined,
    items: resolveSchemaReferences(schema.items, contract, new Set(visitedRefs)),
    allOf: schema.allOf?.map((item) => resolveSchemaReferences(item, contract, new Set(visitedRefs)) ?? {}),
    oneOf: schema.oneOf?.map((item) => resolveSchemaReferences(item, contract, new Set(visitedRefs)) ?? {}),
    anyOf: schema.anyOf?.map((item) => resolveSchemaReferences(item, contract, new Set(visitedRefs)) ?? {}),
    additionalProperties:
      schema.additionalProperties && typeof schema.additionalProperties === 'object'
        ? resolveSchemaReferences(schema.additionalProperties, contract, new Set(visitedRefs)) ?? {}
        : schema.additionalProperties
  };
};

const renderOperationTypeExports = (operation: ParsedOperationContract): string => {
  const names = makeOperationTypeNames(operation);
  const paramsShape = buildParamsShape(operation.parameters);
  const responseType = schemaToTypeSource(getPrimarySuccessSchema(operation));
  const bodyType = schemaToTypeSource(operation.requestBody?.schema);
  const errorMembers =
    operation.errorResponses.length > 0
      ? operation.errorResponses
          .map((errorResponse) => {
            const errorSchema = schemaToTypeSource(errorResponse.schema);
            return `  | {\n      status: ${JSON.stringify(errorResponse.status)};\n      code: ${JSON.stringify(
              makeDocumentedErrorCode(operation, errorResponse.status)
            )};\n      description?: ${JSON.stringify(
              errorResponse.description ?? ''
            )};\n      retryable?: ${JSON.stringify(
              isRetryableStatus(errorResponse.status)
            )};\n      uiHint?: ${JSON.stringify(
              inferUiHint(errorResponse.status)
            )};\n      data?: ${errorSchema};\n    }`;
          })
          .join('\n')
      : '  | never';

  const lines = [
    `export type ${names.params} = ${paramsShape.typeSource};`,
    `export type ${names.response} = ${responseType};`,
    `export type ${names.error} =`,
    errorMembers.endsWith('never') ? '  never;' : `${errorMembers};`
  ];

  if (operation.requestBody) {
    lines.splice(1, 0, `export type ${names.body} = ${bodyType};`);
  }

  return `${lines.join('\n')}\n`;
};

const escapeTemplateLiteral = (value: string): string =>
  value.replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const buildRouteExpression = (operation: ParsedOperationContract, typeName: string): string => {
  const pathParameters = operation.parameters.filter((parameter) => parameter.in === 'path');
  const queryParameters = operation.parameters.filter((parameter) => parameter.in === 'query');

  if (pathParameters.length === 0 && queryParameters.length === 0) {
    return quote(operation.route);
  }

  const routeWithPath = operation.route.replace(/\{([^}]+)\}/g, (_, name: string) => {
    return `\${encodeURIComponent(String(params.${sanitizeName(name)}))}`;
  });

  if (queryParameters.length === 0) {
    return `(params: ${typeName}) => \`${escapeTemplateLiteral(routeWithPath)}\``;
  }

  const queryBuilder = queryParameters
    .map((parameter) => {
      const property = sanitizeName(parameter.name);
      return `    if (params.${property} !== undefined) searchParams.set(${quote(
        parameter.name
      )}, String(params.${property}));`;
    })
    .join('\n');

  return [
    `(params: ${typeName}) => {`,
    `    const pathname = \`${escapeTemplateLiteral(routeWithPath)}\`;`,
    '    const searchParams = new URLSearchParams();',
    queryBuilder,
    '    const queryString = searchParams.toString();',
    "    return queryString ? `${pathname}?${queryString}` : pathname;",
    '  }'
  ].join('\n');
};

const renderOperationAsScrewMethod = (operation: ParsedOperationContract): string => {
  const typeNames = makeOperationTypeNames(operation);
  const lines = [
    `    ${operation.methodName}: {`,
    `      type: '${operation.httpMethod === 'GET' ? 'query' : 'mutation'}',`,
    `      route: ${buildRouteExpression(operation, typeNames.params)},`,
    `      httpMethod: '${operation.httpMethod}',`
  ];

  if (operation.parameters.length > 0) {
    lines.push(`      paramsValidator: validate${pascalCase(operation.methodName)}ParamsArgs,`);
  }

  if (operation.requestBody) {
    lines.push(`      bodyValidator: validate${pascalCase(operation.methodName)}Body,`);
  }

  if (getPrimarySuccessSchema(operation)) {
    lines.push(`      responseValidator: validate${pascalCase(operation.methodName)}Response,`);
  }

  if (operation.errorResponses.length > 0) {
    lines.push(`      documentedErrors: ${pascalCase(operation.methodName)}Errors,`);
  }

  if (operation.httpMethod === 'GET') {
    lines.push(
      "      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],"
    );
  }

  if (operation.summary || operation.description) {
    lines.push(
      `      description: ${JSON.stringify(operation.summary ?? operation.description ?? '')},`
    );
  }

  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  lines.push('    }');
  return lines.join('\n');
};

const renderScrewsFile = (contract: ParsedOpenApiContract): string => {
  const groups = groupOperationsByScrew(contract.operations);
  const declarations = [...groups.entries()].map(
    ([screwName, operations]) => `export const ${screwName}Screw = {
  name: ${quote(screwName)},
  methods: {
${operations.map(renderOperationAsScrewMethod).join(',\n')}
  }
};`
  );

  const collection = `export const generatedScrews = {
${[...groups.keys()].map((screwName) => `  ${screwName}: ${screwName}Screw,`).join('\n')}
};`;

  return `import type { ScrewsMap } from 'reactscrew';
import type {
${unique(
  contract.operations.flatMap((operation) => {
    const names = makeOperationTypeNames(operation);
    return [names.params];
  })
)
  .map((name) => `  ${name},`)
  .join('\n')}
} from '../types';
import {
${contract.operations
  .map((operation) => {
    const baseName = pascalCase(operation.methodName);
    const imports = [];
    if (operation.parameters.length > 0) {
      imports.push(`  validate${baseName}ParamsArgs,`);
    }
    if (operation.requestBody) {
      imports.push(`  validate${baseName}Body,`);
    }
    if (getPrimarySuccessSchema(operation)) {
      imports.push(`  validate${baseName}Response,`);
    }
    return imports.join('\n');
  })
  .filter(Boolean)
  .join('\n')}
} from '../validators';
import {
${contract.operations
  .filter((operation) => operation.errorResponses.length > 0)
  .map((operation) => `  ${pascalCase(operation.methodName)}Errors,`)
  .join('\n')}
} from '../errors';

${declarations.join('\n\n')}

${collection}

export const screws = generatedScrews satisfies ScrewsMap;
`;
};

const renderHooksFile = (contract: ParsedOpenApiContract): string => {
  const lines = [
    "import { useScrewMutation, useScrewQuery } from 'reactscrew';",
    "import type { QueryObserverOptions, UseScrewMutationOptions } from 'reactscrew';",
    "import type {"
  ];

  const typeImports = unique(contract.operations.flatMap((operation) => {
    const names = makeOperationTypeNames(operation);
    if (operation.httpMethod === 'GET') {
      return [names.params, names.response];
    }

    return operation.requestBody
      ? [names.params, names.body, names.response]
      : [names.params, names.response];
  }));

  lines.push(
    typeImports.map((name) => `  ${name},`).join('\n')
  );
  lines.push("} from '../types';\n");

  contract.operations.forEach((operation) => {
    const names = makeOperationTypeNames(operation);
    const baseHookName = `use${pascalCase(operation.methodName)}${
      operation.httpMethod === 'GET' ? 'Query' : 'Mutation'
    }`;

    if (operation.httpMethod === 'GET') {
      lines.push(`export const ${baseHookName} = (
  params${buildParamsShape(operation.parameters).hasMembers ? '' : '?'}: ${names.params},
  options?: Omit<QueryObserverOptions<[${names.params}], ${names.response}>, 'args'>
) =>
  useScrewQuery<${names.response}>(${quote(operation.screwName)}, ${quote(operation.methodName)}, {
    ...options,
    args: params === undefined ? [] : [params]
  });
`);
      return;
    }

    const mutationVariableType = operation.requestBody ? names.body : 'unknown';
    const hasParams = buildParamsShape(operation.parameters).hasMembers;

    lines.push(`export const ${baseHookName} = (
  options?: UseScrewMutationOptions<${names.response}, ${mutationVariableType}>
) => {
  const mutation = useScrewMutation<${names.response}, ${mutationVariableType}>(
    ${quote(operation.screwName)},
    ${quote(operation.methodName)},
    options
  );

  return {
    ...mutation,
    mutate: (body${hasParams ? `: ${mutationVariableType}, params?: ${names.params}` : `?: ${mutationVariableType}`}) =>
      mutation.mutate(body${hasParams ? ', params' : ''}),
    mutateAsync: (body${hasParams ? `: ${mutationVariableType}, params?: ${names.params}` : `?: ${mutationVariableType}`}) =>
      mutation.mutateAsync(body${hasParams ? ', params' : ''})
  };
};
`);
  });

  return `${lines.join('\n')}`;
};

const renderErrorsFile = (contract: ParsedOpenApiContract): string => {
  const lines = ["import type { DocumentedErrorDefinition } from 'reactscrew';", '', 'export const generatedErrorCatalog = {'];

  contract.operations.forEach((operation) => {
    const names = makeOperationTypeNames(operation);
    lines.push(`  ${names.error.replace(/Error$/, '')}: [`);
    operation.errorResponses.forEach((errorResponse) => {
      lines.push(
        `    { status: ${quote(errorResponse.status)}, code: ${quote(
          makeDocumentedErrorCode(operation, errorResponse.status)
        )}, description: ${quote(errorResponse.description ?? '')}, retryable: ${JSON.stringify(
          isRetryableStatus(errorResponse.status)
        )}, uiHint: ${quote(inferUiHint(errorResponse.status))} },`
      );
    });
    lines.push('  ],');
  });

  lines.push('} as const;');
  lines.push('');

  contract.operations.forEach((operation) => {
    const names = makeOperationTypeNames(operation);
    const catalogName = `${pascalCase(operation.methodName)}Errors`;
    lines.push(
      `export const ${catalogName}: DocumentedErrorDefinition[] = generatedErrorCatalog.${names.error.replace(/Error$/, '')} as unknown as DocumentedErrorDefinition[];`
    );
  });

  return `${lines.join('\n')}\n`;
};

const renderValidatorsFile = (contract: ParsedOpenApiContract): string => {
  const lines = ["import { createSchemaValidator } from 'reactscrew';", "import type { RuntimeValidator } from 'reactscrew';", "import type {"];
  const typeImports = unique(
    contract.operations.flatMap((operation) => {
      const names = makeOperationTypeNames(operation);
      const items = [names.params, names.response];
      if (operation.requestBody) {
        items.push(names.body);
      }
      return items;
    })
  );
  lines.push(typeImports.map((name) => `  ${name},`).join('\n'));
  lines.push("} from '../types';\n");

  contract.operations.forEach((operation) => {
    const baseName = pascalCase(operation.methodName);
    const typeNames = makeOperationTypeNames(operation);

    if (operation.parameters.length > 0) {
      lines.push(`const ${baseName}ParamsSchema = ${schemaLiteral(resolveSchemaReferences(buildParameterSchema(operation), contract))} as const;`);
      lines.push(`const validate${baseName}Params = createSchemaValidator<${typeNames.params}>(${baseName}ParamsSchema, ${quote(`${operation.methodName} params`)});`);
      lines.push(`export const validate${baseName}ParamsArgs: RuntimeValidator<[${typeNames.params}]> = (args) => {
  const [params] = args;
  return [validate${baseName}Params((params ?? {}) as ${typeNames.params})];
};\n`);
    }

    if (operation.requestBody) {
      lines.push(`const ${baseName}BodySchema = ${schemaLiteral(resolveSchemaReferences(operation.requestBody.schema, contract))} as const;`);
      lines.push(`export const validate${baseName}Body = createSchemaValidator<${typeNames.body}>(${baseName}BodySchema, ${quote(`${operation.methodName} body`)});\n`);
    }

    if (getPrimarySuccessSchema(operation)) {
      lines.push(`const ${baseName}ResponseSchema = ${schemaLiteral(resolveSchemaReferences(getPrimarySuccessSchema(operation), contract))} as const;`);
      lines.push(`export const validate${baseName}Response = createSchemaValidator<${typeNames.response}>(${baseName}ResponseSchema, ${quote(`${operation.methodName} response`)});\n`);
    }
  });

  return `${lines.join('\n')}`;
};

const renderTypesFile = (contract: ParsedOpenApiContract): string => {
  const schemaExports = contract.schemas.map(renderSchemaExport).join('\n');
  const operationExports = contract.operations.map(renderOperationTypeExports).join('\n');
  return `${schemaExports}\n${operationExports}`;
};

const renderGeneratedIndexFile = (): string => `export * from './types';
export * from './errors';
export * from './validators';
export * from './screws';
export * from './hooks';
`;

const renderWrappersIndexFile = (): string => `export * from '../generated';
`;

const renderCustomIndexFile = (): string => `// Add project-specific wrappers here. This file is preserved across regenerations.
`;

const renderRootIndexFile = (): string => `export * from './generated';
export * from './wrappers';
`;

const buildArtifactMap = (contract: ParsedOpenApiContract): Record<string, string> => ({
  'generated/index.ts': renderGeneratedIndexFile(),
  'generated/types/index.ts': renderTypesFile(contract),
  'generated/errors/index.ts': renderErrorsFile(contract),
  'generated/validators/index.ts': renderValidatorsFile(contract),
  'generated/screws/index.ts': renderScrewsFile(contract),
  'generated/hooks/index.ts': renderHooksFile(contract),
  'wrappers/index.ts': renderWrappersIndexFile(),
  'custom/index.ts': renderCustomIndexFile(),
  'index.ts': renderRootIndexFile()
});

const writeGeneratedArtifacts = async (
  outputDirectory: string,
  files: Record<string, string>
): Promise<void> => {
  await Promise.all(
    Object.entries(files).map(async ([relativePath, content]) => {
      const targetPath = path.join(outputDirectory, relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });

      const preserveCustomFile = relativePath.startsWith('custom/') || relativePath.startsWith('wrappers/');
      if (preserveCustomFile) {
        try {
          await fs.access(targetPath);
          return;
        } catch {
          // File does not exist yet, continue.
        }
      }

      await fs.writeFile(targetPath, content, 'utf8');
    })
  );
};

export const parseOpenApiDocument = (
  document: OpenApiDocument,
  source = 'inline-document'
): ParsedOpenApiContract => {
  assertOpenApiDocument(document, source);

  return {
    source,
    title: document.info?.title,
    version: document.info?.version,
    description: document.info?.description,
    schemas: parseSchemas(document),
    operations: parseOperations(document)
  };
};

export const loadOpenApiContract = async (source: string): Promise<ParsedOpenApiContract> => {
  const content = await readSourceAsText(source);
  const document = JSON.parse(content) as OpenApiDocument;
  return parseOpenApiDocument(document, source);
};

export const validateOpenApiContract = (
  contract: ParsedOpenApiContract
): OpenApiValidationResult => {
  const errors: string[] = [];

  if (contract.operations.length === 0) {
    errors.push('No operations found in contract.');
  }

  contract.operations.forEach((operation) => {
    if (!operation.route.startsWith('/')) {
      errors.push(`Operation "${operation.methodName}" has a non-absolute route "${operation.route}".`);
    }

    if (operation.httpMethod === 'GET' && operation.requestBody) {
      errors.push(`GET operation "${operation.methodName}" should not declare a request body.`);
    }
  });

  return {
    valid: errors.length === 0,
    source: contract.source,
    operationCount: contract.operations.length,
    schemaCount: contract.schemas.length,
    errors
  };
};

export const generateScrewsFromOpenApiContract = (
  contract: ParsedOpenApiContract
): string => {
  return renderScrewsFile(contract);
};

export const generateScrewsFromOpenApiDocument = (document: OpenApiDocument): string =>
  generateScrewsFromOpenApiContract(parseOpenApiDocument(document));

export const generateScrewsFromOpenApiFile = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  const contract = await loadOpenApiContract(inputPath);
  const content = generateScrewsFromOpenApiContract(contract);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, content, 'utf8');
};

export const generateOpenApiArtifacts = (
  contract: ParsedOpenApiContract
): GeneratedOpenApiArtifacts => ({
  contract,
  files: buildArtifactMap(contract)
});

export const generateOpenApiArtifactsFromDocument = (
  document: OpenApiDocument,
  source = 'inline-document'
): GeneratedOpenApiArtifacts => generateOpenApiArtifacts(parseOpenApiDocument(document, source));

export const generateOpenApiArtifactsFromFile = async (
  inputPath: string,
  outputDirectory: string
): Promise<GeneratedOpenApiArtifacts> => {
  const contract = await loadOpenApiContract(inputPath);
  const artifacts = generateOpenApiArtifacts(contract);
  await writeGeneratedArtifacts(outputDirectory, artifacts.files);
  return artifacts;
};
