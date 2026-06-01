'use client';

import type { ReactScrewClient, RequestEvent } from '../types';

export interface OTelTracerLike {
  startActiveSpan: <T>(name: string, fn: (span: OTelSpanLike) => Promise<T>, options?: { attributes?: Record<string, string | number | boolean> }) => Promise<T>;
}

export interface OTelSpanLike {
  setAttribute: (key: string, value: string | number | boolean) => void;
  setStatus: (status: { code: number; message?: string }) => void;
  end: () => void;
  addEvent: (name: string, attributes?: Record<string, unknown>) => void;
}

const activeSpans = new Map<string, OTelSpanLike>();

const eventToSpanName = (event: RequestEvent): string => {
  const op = event.type.replace(':', '.');
  return `${op} ${event.screwName}.${event.methodName}`;
};

export const withOpenTelemetry = (
  client: ReactScrewClient,
  tracer: OTelTracerLike
): (() => void) => {
  const handleStart = async (event: RequestEvent) => {
    const key = `${event.screwName}.${event.methodName}`;
    const spanName = eventToSpanName(event);

    await tracer.startActiveSpan(spanName, async (span) => {
      activeSpans.set(key, span);
      span.setAttribute('screwName', event.screwName);
      span.setAttribute('methodName', event.methodName);
      span.setAttribute('eventType', event.type);
      if (event.queryKey) {
        span.setAttribute('queryKey', JSON.stringify(event.queryKey));
      }
    }, {
      attributes: {
        'screwName': event.screwName,
        'methodName': event.methodName,
        'eventType': event.type
      }
    });
  };

  return client.subscribeEvents((event) => {
    const key = `${event.screwName}.${event.methodName}`;

    if (event.type === 'query:start' || event.type === 'mutation:start') {
      handleStart(event);
    } else {
      const span = activeSpans.get(key);
      if (!span) return;

      if (event.type.includes('error')) {
        span.setStatus({ code: 2, message: event.error?.message ?? 'Error' });
        span.addEvent('error', {
          'error.message': event.error?.message,
          'error.code': event.error?.code
        });
      } else {
        span.setStatus({ code: 1 });
      }

      if (event.durationMs !== undefined) {
        span.setAttribute('durationMs', event.durationMs);
      }

      span.end();
      activeSpans.delete(key);
    }
  });
};
