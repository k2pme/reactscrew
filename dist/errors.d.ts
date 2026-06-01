import type { DocumentedErrorDefinition, ReactScrewErrorShape } from './types';
interface ReactScrewErrorOptions {
    code: string;
    status?: number;
    description?: string;
    details?: unknown;
    cause?: unknown;
    retryable?: boolean;
    uiHint?: string;
}
export declare class ReactScrewError extends Error implements ReactScrewErrorShape {
    code: string;
    status?: number;
    description?: string;
    details?: unknown;
    cause?: unknown;
    retryable?: boolean;
    uiHint?: string;
    constructor(message: string, options: ReactScrewErrorOptions);
}
export declare const normalizeError: (error: unknown, message: string, documentedErrors?: DocumentedErrorDefinition[]) => ReactScrewError;
export {};
