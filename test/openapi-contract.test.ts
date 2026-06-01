import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  generateOpenApiArtifacts,
  generateOpenApiArtifactsFromFile,
  generateScrewsFromOpenApiContract,
  type OpenApiDocument,
  parseOpenApiDocument,
  validateOpenApiContract
} from '../src/generation/openapi';

describe('OpenAPI contract parsing', () => {
  const document: OpenApiDocument = {
    openapi: '3.0.0',
    info: {
      title: 'Demo API',
      version: '1.2.3',
      description: 'Contract test'
    },
    paths: {
      '/users': {
        parameters: [
          {
            name: 'tenant',
            in: 'header',
            required: true,
            description: 'Tenant id'
          }
        ],
        get: {
          operationId: 'listUsers',
          summary: 'List users',
          responses: {
            '200': {
              description: 'User list',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        },
        post: {
          operationId: 'createUser',
          description: 'Create a user',
          requestBody: {
            required: true,
            description: 'Create payload',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreateUserInput'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/User'
                  }
                }
              }
            },
            default: {
              description: 'Unexpected error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          description: 'User entity'
        },
        CreateUserInput: {
          type: 'object'
        },
        Error: {
          type: 'object',
          description: 'Error payload'
        }
      }
    }
  };

  it('parses operations, schemas and error responses', () => {
    const contract = parseOpenApiDocument(document, 'memory://demo.json');

    expect(contract.title).toBe('Demo API');
    expect(contract.version).toBe('1.2.3');
    expect(contract.schemas).toHaveLength(3);
    expect(contract.operations).toHaveLength(2);
    expect(contract.operations[0]).toMatchObject({
      screwName: 'users',
      methodName: 'listUsers',
      httpMethod: 'GET',
      route: '/users'
    });
    expect(contract.operations[0].parameters).toHaveLength(1);
    expect(contract.operations[0].errorResponses).toEqual([
      expect.objectContaining({
        status: '401',
        description: 'Unauthorized'
      })
    ]);
    expect(contract.operations[1].requestBody).toMatchObject({
      required: true,
      description: 'Create payload'
    });
  });

  it('validates the parsed contract', () => {
    const contract = parseOpenApiDocument(document, 'memory://demo.json');
    const result = validateOpenApiContract(contract);

    expect(result.valid).toBe(true);
    expect(result.operationCount).toBe(2);
    expect(result.schemaCount).toBe(3);
    expect(result.errors).toEqual([]);
  });

  it('generates screws from the parsed contract', () => {
    const contract = parseOpenApiDocument(document, 'memory://demo.json');
    const generated = generateScrewsFromOpenApiContract(contract);

    expect(generated).toContain("export const usersScrew");
    expect(generated).toContain("listUsers");
    expect(generated).toContain("createUser");
    expect(generated).toContain('description: "List users"');
    expect(generated).toContain('queryKey: ({ screwName, methodName, args })');
  });

  it('flags invalid GET request bodies during validation', () => {
    const invalid = parseOpenApiDocument(
      {
        paths: {
          '/search': {
            get: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: { type: 'object' }
                  }
                }
              },
              responses: {
                '200': { description: 'ok' }
              }
            }
          }
        }
      },
      'memory://invalid.json'
    );

    const result = validateOpenApiContract(invalid);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('GET operation');
  });

  it('builds a stable generated artifact structure', () => {
    const contract = parseOpenApiDocument(document, 'memory://demo.json');
    const artifacts = generateOpenApiArtifacts(contract);

    expect(Object.keys(artifacts.files)).toEqual(
      expect.arrayContaining([
        'generated/index.ts',
        'generated/types/index.ts',
        'generated/errors/index.ts',
        'generated/validators/index.ts',
        'generated/screws/index.ts',
        'generated/hooks/index.ts',
        'wrappers/index.ts',
        'custom/index.ts',
        'index.ts'
      ])
    );
    expect(artifacts.files['generated/hooks/index.ts']).toContain('useListUsersQuery');
    expect(artifacts.files['generated/hooks/index.ts']).toContain('useCreateUserMutation');
    expect(artifacts.files['generated/types/index.ts']).toContain('export type ListUsersParams');
    expect(artifacts.files['generated/validators/index.ts']).toContain('validateListUsersResponse');
    expect(artifacts.files['generated/errors/index.ts']).toContain('generatedErrorCatalog');
    expect(artifacts.files['generated/screws/index.ts']).toContain('documentedErrors: ListUsersErrors');
  });

  it('writes generated artifacts without overwriting custom files', async () => {
    const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'reactscrew-openapi-'));
    const inputPath = path.join(tempDirectory, 'openapi.json');
    const outputDirectory = path.join(tempDirectory, 'codegen');

    await fs.writeFile(inputPath, JSON.stringify(document), 'utf8');
    await fs.mkdir(path.join(outputDirectory, 'custom'), { recursive: true });
    await fs.mkdir(path.join(outputDirectory, 'wrappers'), { recursive: true });
    await fs.writeFile(
      path.join(outputDirectory, 'custom', 'index.ts'),
      '// keep custom\n',
      'utf8'
    );
    await fs.writeFile(
      path.join(outputDirectory, 'wrappers', 'index.ts'),
      '// keep wrapper\n',
      'utf8'
    );

    const artifacts = await generateOpenApiArtifactsFromFile(inputPath, outputDirectory);
    const hooksFile = await fs.readFile(
      path.join(outputDirectory, 'generated', 'hooks', 'index.ts'),
      'utf8'
    );
    const customFile = await fs.readFile(path.join(outputDirectory, 'custom', 'index.ts'), 'utf8');
    const wrapperFile = await fs.readFile(
      path.join(outputDirectory, 'wrappers', 'index.ts'),
      'utf8'
    );

    expect(artifacts.contract.operations).toHaveLength(2);
    expect(hooksFile).toContain('useListUsersQuery');
    expect(customFile).toBe('// keep custom\n');
    expect(wrapperFile).toBe('// keep wrapper\n');
  });
});
