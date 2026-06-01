import { describe, expect, it } from 'vitest';
import { normalizeError, ReactScrewError } from '../src/errors';
import { createSchemaValidator, validateValueAgainstSchema } from '../src/validation/openapi';

describe('contract runtime validation and error normalization', () => {
  it('validates nested objects against OpenAPI-like schemas', () => {
    const validator = createSchemaValidator<{
      id: number;
      profile: { name: string; roles: string[] };
    }>(
      {
        type: 'object',
        required: ['id', 'profile'],
        additionalProperties: false,
        properties: {
          id: { type: 'integer' },
          profile: {
            type: 'object',
            required: ['name', 'roles'],
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              roles: {
                type: 'array',
                items: { type: 'string' }
              }
            }
          }
        }
      },
      'user response'
    );

    expect(
      validator({
        id: 1,
        profile: {
          name: 'Jane',
          roles: ['admin']
        }
      })
    ).toEqual({
      id: 1,
      profile: {
        name: 'Jane',
        roles: ['admin']
      }
    });

    expect(() =>
      validator({
        id: 1,
        profile: {
          name: 'Jane',
          roles: ['admin'],
          extra: true
        }
      } as never)
    ).toThrowError(ReactScrewError);
  });

  it('normalizes documented backend errors with description and ui hints', () => {
    const error = new Error('Request failed');
    Object.assign(error, {
      response: {
        status: 422,
        data: {
          code: 'CREATEUSER_422',
          message: 'Email already used',
          details: { field: 'email' }
        }
      }
    });

    const normalized = normalizeError(error, 'Mutation failed.', [
      {
        status: '422',
        code: 'CREATEUSER_422',
        description: 'User creation payload is invalid.',
        retryable: false,
        uiHint: 'form'
      }
    ]);

    expect(normalized).toMatchObject({
      code: 'CREATEUSER_422',
      status: 422,
      message: 'Email already used',
      description: 'User creation payload is invalid.',
      retryable: false,
      uiHint: 'form',
      details: { field: 'email' }
    });
  });

  it('supports enum validation failures with explicit context', () => {
    expect(() =>
      validateValueAgainstSchema('guest', { type: 'string', enum: ['admin', 'editor'] }, 'role')
    ).toThrowError(ReactScrewError);
  });
});
