type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
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
export declare const parseOpenApiDocument: (document: OpenApiDocument, source?: string) => ParsedOpenApiContract;
export declare const loadOpenApiContract: (source: string) => Promise<ParsedOpenApiContract>;
export declare const validateOpenApiContract: (contract: ParsedOpenApiContract) => OpenApiValidationResult;
export declare const generateScrewsFromOpenApiContract: (contract: ParsedOpenApiContract) => string;
export declare const generateScrewsFromOpenApiDocument: (document: OpenApiDocument) => string;
export declare const generateScrewsFromOpenApiFile: (inputPath: string, outputPath: string) => Promise<void>;
export declare const generateOpenApiArtifacts: (contract: ParsedOpenApiContract) => GeneratedOpenApiArtifacts;
export declare const generateOpenApiArtifactsFromDocument: (document: OpenApiDocument, source?: string) => GeneratedOpenApiArtifacts;
export declare const generateOpenApiArtifactsFromFile: (inputPath: string, outputDirectory: string) => Promise<GeneratedOpenApiArtifacts>;
export {};
