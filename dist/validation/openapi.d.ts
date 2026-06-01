import type { OpenApiParameterObject, OpenApiSchemaObject } from '../generation/openapi';
import type { RuntimeValidator } from '../types';
export declare const validateValueAgainstSchema: (value: unknown, schema?: OpenApiSchemaObject, context?: string) => unknown;
export declare const createSchemaValidator: <TValue = unknown>(schema?: OpenApiSchemaObject, context?: string) => RuntimeValidator<TValue>;
export declare const createParameterSchema: (parameters: OpenApiParameterObject[]) => OpenApiSchemaObject;
