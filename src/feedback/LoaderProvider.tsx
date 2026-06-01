'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';
import type { LoaderState, LoaderVariant, LoaderPolicy } from './types';

interface LoaderContextValue {
  loaders: Record<string, LoaderState>;
  showLoader: (key: string, variant?: LoaderVariant, message?: string) => void;
  hideLoader: (key: string) => void;
  isLoading: boolean;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export const LoaderProvider = ({
  children,
  defaultVariant = 'spinner',
  policy = { minDuration: 150 }
}: {
  children: ReactNode;
  defaultVariant?: LoaderVariant;
  policy?: LoaderPolicy;
}) => {
  const [loaders, setLoaders] = useState<Record<string, LoaderState>>({});
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const showLoader = useCallback(
    (key: string, variant?: LoaderVariant, message?: string) => {
      const existingTimer = timersRef.current[key];
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      if (policy.minDuration && policy.minDuration > 0) {
        timersRef.current[key] = setTimeout(() => {
          setLoaders((prev) => ({
            ...prev,
            [key]: { active: true, variant: variant ?? defaultVariant, message }
          }));
        }, policy.minDuration);
      } else {
        setLoaders((prev) => ({
          ...prev,
          [key]: { active: true, variant: variant ?? defaultVariant, message }
        }));
      }
    },
    [defaultVariant, policy.minDuration]
  );

  const hideLoader = useCallback((key: string) => {
    const existingTimer = timersRef.current[key];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete timersRef.current[key];
    }
    setLoaders((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const isLoading = useMemo(
    () => Object.values(loaders).some((l) => l.active),
    [loaders]
  );

  const value = useMemo(
    () => ({ loaders, showLoader, hideLoader, isLoading }),
    [loaders, showLoader, hideLoader, isLoading]
  );

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>;
};

export const useScrewLoader = (): LoaderContextValue => {
  const ctx = useContext(LoaderContext);
  if (!ctx) {
    throw new Error('useScrewLoader must be used within a <LoaderProvider>');
  }
  return ctx;
};
