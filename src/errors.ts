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

export class ReactScrewError extends Error implements ReactScrewErrorShape {
  code: string;
  status?: number;
  description?: string;
  details?: unknown;
  cause?: unknown;
  retryable?: boolean;
  uiHint?: string;

  constructor(message: string, options: ReactScrewErrorOptions) {
    super(message);
    this.name = 'ReactScrewError';
    this.code = options.code;
    this.status = options.status;
    this.description = options.description;
    this.details = options.details;
    this.cause = options.cause;
    this.retryable = options.retryable;
    this.uiHint = options.uiHint;
  }
}

const readResponseShape = (
  error: unknown
): { status?: number; data?: unknown } | undefined => {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const candidate = error as {
    response?: { status?: number; data?: unknown };
    status?: number;
    data?: unknown;
  };

  return candidate.response ?? (candidate.status || candidate.data ? candidate : undefined);
};

const inferRetryable = (status?: number): boolean | undefined => {
  if (status === undefined) {
    return undefined;
  }

  return status === 408 || status === 429 || status >= 500;
};

const findDocumentedError = (
  documentedErrors: DocumentedErrorDefinition[] | undefined,
  status?: number,
  code?: string
): DocumentedErrorDefinition | undefined => {
  if (!documentedErrors || documentedErrors.length === 0) {
    return undefined;
  }

  return documentedErrors.find((documentedError) => {
    const statusMatches =
      documentedError.status === undefined ||
      documentedError.status === 'default' ||
      String(status) === documentedError.status;
    const codeMatches = code ? documentedError.code === code : true;
    return statusMatches && codeMatches;
  });
};

export const normalizeError = (
  error: unknown,
  message: string,
  documentedErrors?: DocumentedErrorDefinition[]
): ReactScrewError => {
  if (error instanceof ReactScrewError) {
    return error;
  }

  const response = readResponseShape(error);
  const payload =
    response?.data && typeof response.data === 'object' ? (response.data as Record<string, unknown>) : undefined;
  const payloadCode = typeof payload?.code === 'string' ? payload.code : undefined;
  const payloadMessage = typeof payload?.message === 'string' ? payload.message : undefined;
  const payloadDescription =
    typeof payload?.description === 'string' ? payload.description : undefined;
  const payloadUiHint = typeof payload?.uiHint === 'string' ? payload.uiHint : undefined;
  const payloadDetails = payload?.details;
  const documentedError = findDocumentedError(documentedErrors, response?.status, payloadCode);

  if (error instanceof Error) {
    return new ReactScrewError(
      payloadMessage || documentedError?.message || error.message || message,
      {
        code: payloadCode || documentedError?.code || 'REQUEST_FAILED',
        status: response?.status,
        description: payloadDescription || documentedError?.description,
        details: payloadDetails ?? response?.data,
        retryable: documentedError?.retryable ?? inferRetryable(response?.status),
        uiHint: payloadUiHint || documentedError?.uiHint,
        cause: error
      }
    );
  }

  return new ReactScrewError(payloadMessage || documentedError?.message || message, {
    code: payloadCode || documentedError?.code || 'REQUEST_FAILED',
    status: response?.status,
    description: payloadDescription || documentedError?.description,
    details: payloadDetails ?? response?.data,
    retryable: documentedError?.retryable ?? inferRetryable(response?.status),
    uiHint: payloadUiHint || documentedError?.uiHint,
    cause: error
  });
};
