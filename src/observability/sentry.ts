'use client';

import type { ReactScrewClient, RequestEvent } from '../types';

export interface SentryLikeInstance {
  captureException: (error: unknown, hint?: { captureContext?: Record<string, unknown>; tags?: Record<string, string>; extra?: Record<string, unknown> }) => void;
  addBreadcrumb: (breadcrumb: { type?: string; category?: string; message?: string; level?: 'debug' | 'info' | 'warning' | 'error'; data?: Record<string, unknown>; timestamp?: number }) => void;
  setTag?: (key: string, value: string) => void;
  setExtra?: (key: string, value: unknown) => void;
}

const eventToBreadcrumb = (event: RequestEvent) => ({
  type: 'http' as const,
  category: 'xhr',
  message: `${event.type} ${event.screwName}.${event.methodName}`,
  level: event.type.includes('error') ? 'error' as const : 'info' as const,
  data: {
    queryKey: event.queryKey,
    status: event.status,
    durationMs: event.durationMs,
    error: event.error
  } as Record<string, unknown>,
  timestamp: event.timestamp
});

export const withSentry = (
  client: ReactScrewClient,
  sentry: SentryLikeInstance,
  options?: {
    captureErrors?: boolean;
    tags?: Record<string, string>;
  }
): (() => void) => {
  const { captureErrors = true, tags } = options ?? {};

  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      sentry.setTag?.(key, value);
    }
  }

  return client.subscribeEvents((event) => {
    sentry.addBreadcrumb(eventToBreadcrumb(event));

    if (captureErrors && (event.type === 'query:error' || event.type === 'mutation:error')) {
      sentry.captureException(event.error ?? new Error(event.type), {
        tags: {
          screwName: event.screwName,
          methodName: event.methodName,
          eventType: event.type
        },
        extra: {
          queryKey: event.queryKey,
          status: event.status,
          durationMs: event.durationMs,
          timestamp: event.timestamp
        }
      });
    }
  });
};
