import { ReactScrewError } from '../errors';
import type { OpenApiParameterObject, OpenApiSchemaObject } from '../generation/openapi';
import type { RuntimeValidator } from '../types';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readRefName = (schema?: OpenApiSchemaObject): string | undefined => {
  const ref = schema?.$ref;
  if (!ref) {
    return undefined;
  }

  const parts = ref.split('/');
  return parts[parts.length - 1];
};

const validateEnum = (value: unknown, schema: OpenApiSchemaObject, context: string): void => {
  if (schema.enum && !schema.enum.includes(value)) {
    throw new ReactScrewError(`Validation failed for ${context}.`, {
      code: 'SCHEMA_VALIDATION_FAILED',
      description: `Expected one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}.`,
      details: { context, expected: schema.enum, received: value }
    });
  }
};

export const validateValueAgainstSchema = (
  value: unknown,
  schema?: OpenApiSchemaObject,
  context = 'value'
): unknown => {
  if (!schema) {
    return value;
  }

  const refName = readRefName(schema);
  if (refName) {
    return value;
  }

  validateEnum(value, schema, context);

  if (schema.oneOf?.length) {
    const passes = schema.oneOf.some((item) => {
      try {
        validateValueAgainstSchema(value, item, context);
        return true;
      } catch {
        return false;
      }
    });

    if (!passes) {
      throw new ReactScrewError(`Validation failed for ${context}.`, {
        code: 'SCHEMA_VALIDATION_FAILED',
        description: `Value does not match any allowed schema for ${context}.`,
        details: { context, received: value }
      });
    }

    return value;
  }

  if (schema.anyOf?.length) {
    const passes = schema.anyOf.some((item) => {
      try {
        validateValueAgainstSchema(value, item, context);
        return true;
      } catch {
        return false;
      }
    });

    if (!passes) {
      throw new ReactScrewError(`Validation failed for ${context}.`, {
        code: 'SCHEMA_VALIDATION_FAILED',
        description: `Value does not match any variant for ${context}.`,
        details: { context, received: value }
      });
    }

    return value;
  }

  if (schema.allOf?.length) {
    schema.allOf.forEach((item) => {
      validateValueAgainstSchema(value, item, context);
    });
    return value;
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected string for ${context}.`,
          details: { context, received: value }
        });
      }
      return value;
    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected integer for ${context}.`,
          details: { context, received: value }
        });
      }
      return value;
    case 'number':
      if (typeof value !== 'number') {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected number for ${context}.`,
          details: { context, received: value }
        });
      }
      return value;
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected boolean for ${context}.`,
          details: { context, received: value }
        });
      }
      return value;
    case 'array':
      if (!Array.isArray(value)) {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected array for ${context}.`,
          details: { context, received: value }
        });
      }
      value.forEach((item, index) => {
        validateValueAgainstSchema(item, schema.items, `${context}[${index}]`);
      });
      return value;
    case 'object': {
      if (!isPlainObject(value)) {
        throw new ReactScrewError(`Validation failed for ${context}.`, {
          code: 'SCHEMA_VALIDATION_FAILED',
          description: `Expected object for ${context}.`,
          details: { context, received: value }
        });
      }

      const required = new Set(schema.required ?? []);
      required.forEach((key) => {
        if (!(key in value)) {
          throw new ReactScrewError(`Validation failed for ${context}.`, {
            code: 'SCHEMA_VALIDATION_FAILED',
            description: `Missing required field "${key}" in ${context}.`,
            details: { context, missing: key, received: value }
          });
        }
      });

      Object.entries(schema.properties ?? {}).forEach(([key, propertySchema]) => {
        if (key in value) {
          validateValueAgainstSchema(value[key], propertySchema, `${context}.${key}`);
        }
      });

      if (schema.additionalProperties === false) {
        const allowed = new Set(Object.keys(schema.properties ?? {}));
        Object.keys(value).forEach((key) => {
          if (!allowed.has(key)) {
            throw new ReactScrewError(`Validation failed for ${context}.`, {
              code: 'SCHEMA_VALIDATION_FAILED',
              description: `Unexpected field "${key}" in ${context}.`,
              details: { context, field: key, received: value }
            });
          }
        });
      }

      if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
        const additionalPropertiesSchema = schema.additionalProperties;
        Object.entries(value).forEach(([key, itemValue]) => {
          if (!(schema.properties && key in schema.properties)) {
            validateValueAgainstSchema(
              itemValue,
              additionalPropertiesSchema,
              `${context}.${key}`
            );
          }
        });
      }

      return value;
    }
    default:
      return value;
  }
};

export const createSchemaValidator = <TValue = unknown>(
  schema?: OpenApiSchemaObject,
  context = 'value'
): RuntimeValidator<TValue> => {
  return (value: TValue): TValue => validateValueAgainstSchema(value, schema, context) as TValue;
};

export const createParameterSchema = (
  parameters: OpenApiParameterObject[]
): OpenApiSchemaObject => ({
  type: 'object',
  required: parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name),
  properties: Object.fromEntries(
    parameters.map((parameter) => [parameter.name, parameter.schema ?? { type: 'string' }])
  ),
  additionalProperties: false
});
