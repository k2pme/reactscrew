'use client';

import React, { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ToastProvider, useScrewToast } from './ToastProvider';
import { LoaderProvider, useScrewLoader } from './LoaderProvider';
import { useScrewClient } from '../hooks/useScrewClient';
import type { FeedbackConfig, ToastErrorMapping, ToastVariant } from './types';

const getToastForError = (
  error: { code?: string; status?: number; uiHint?: string; message?: string },
  mappings?: ToastErrorMapping[]
): { message: string; variant: ToastVariant } | null => {
  if (mappings) {
    for (const m of mappings) {
      if ((m.code && m.code === error.code) || (m.status && m.status === error.status)) {
        return { message: m.message ?? error.uiHint ?? error.message ?? 'An error occurred', variant: m.variant ?? 'error' };
      }
    }
  }
  return { message: error.uiHint ?? error.message ?? 'An error occurred', variant: 'error' };
};

const FeedbackInner = ({ config }: { config: FeedbackConfig }) => {
  const client = useScrewClient();
  const { addToast } = useScrewToast();
  const { showLoader, hideLoader } = useScrewLoader();
  const configRef = useRef(config);
  configRef.current = config;

  const queryLoaderKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    const unsub = client.subscribeEvents((event) => {
      const cfg = configRef.current;

      if (cfg.toasts) {
        if (cfg.toasts.onError && (event.type === 'query:error' || event.type === 'mutation:error')) {
          const toast = getToastForError(
            event.error ?? { message: `${event.screwName}.${event.methodName} failed` },
            Array.isArray(cfg.toasts.onError) ? cfg.toasts.onError : undefined
          );
          if (toast) {
            addToast({
              message: toast.message,
              variant: toast.variant,
              duration: cfg.toasts.defaultDuration ?? cfg.toasts.onError === true ? 5000 : 5000
            });
          }
        }

        if (cfg.toasts.onSuccess && (event.type === 'query:success' || event.type === 'mutation:success')) {
          addToast({
            message: typeof cfg.toasts.onSuccess === 'object' && cfg.toasts.onSuccess.message
              ? cfg.toasts.onSuccess.message
              : `${event.screwName}.${event.methodName} succeeded`,
            variant: 'success',
            duration: cfg.toasts.onSuccess === true ? 4000 : (cfg.toasts.onSuccess as { duration?: number }).duration ?? 4000
          });
        }
      }

      if (cfg.loaders?.enabled) {
        const key = `${event.screwName}.${event.methodName}`;
        if (event.type === 'query:start' || event.type === 'mutation:start') {
          queryLoaderKeys.current.add(key);
          showLoader(key, cfg.loaders?.defaultVariant, `${event.screwName}.${event.methodName}...`);
        } else if (event.type === 'query:success' || event.type === 'query:error' || event.type === 'mutation:success' || event.type === 'mutation:error') {
          queryLoaderKeys.current.delete(key);
          hideLoader(key);
        }
      }
    });

    return unsub;
  }, [client, addToast, showLoader, hideLoader]);

  return null;
};

export const FeedbackProvider = ({
  children,
  config
}: {
  children: ReactNode;
  config: FeedbackConfig;
}) => {
  const { toasts: toastCfg, loaders: loaderCfg } = config;

  const toastElements = useMemo(() => {
    if (!toastCfg) return null;
    return (
      <ToastProvider
        position={toastCfg.position}
        duration={toastCfg.defaultDuration ?? 5000}
        maxToasts={toastCfg.maxToasts ?? 5}
      >
        <LoaderProvider
          defaultVariant={loaderCfg?.defaultVariant ?? 'spinner'}
          policy={loaderCfg?.policy ?? { minDuration: 150 }}
        >
          <FeedbackInner config={config} />
          {children}
        </LoaderProvider>
      </ToastProvider>
    );
  }, [toastCfg, loaderCfg, children, config]);

  if (toastElements) return toastElements;

  return (
    <LoaderProvider
      defaultVariant={loaderCfg?.defaultVariant ?? 'spinner'}
      policy={loaderCfg?.policy ?? { minDuration: 150 }}
    >
      <FeedbackInner config={config} />
      {children}
    </LoaderProvider>
  );
};
