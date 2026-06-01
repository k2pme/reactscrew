'use client';

import { useCallback } from 'react';
import { useScrewToast } from '../feedback/ToastProvider';
import { useScrewLoader } from '../feedback/LoaderProvider';
import type { LoaderVariant, ToastVariant } from '../feedback/types';

export interface ScrewFeedback {
  addToast: (message: string, variant?: ToastVariant, duration?: number) => string;
  removeToast: (id: string) => void;
  showLoader: (key: string, variant?: LoaderVariant, message?: string) => void;
  hideLoader: (key: string) => void;
  onSuccess: (message: string) => void;
  onError: (error: { message?: string; code?: string; uiHint?: string }) => void;
}

export const useScrewFeedback = (): ScrewFeedback => {
  const { addToast: addToastCtx, removeToast } = useScrewToast();
  const { showLoader, hideLoader } = useScrewLoader();

  const addToast = useCallback(
    (message: string, variant?: ToastVariant, duration?: number): string =>
      addToastCtx({ message, variant: variant ?? 'info', duration: duration ?? 5000 }),
    [addToastCtx]
  );

  const onSuccess = useCallback(
    (message: string) => {
      addToastCtx({ message, variant: 'success', duration: 4000 });
    },
    [addToastCtx]
  );

  const onError = useCallback(
    (error: { message?: string; code?: string; uiHint?: string }) => {
      addToastCtx({
        message: error.uiHint ?? error.message ?? 'An error occurred',
        variant: 'error',
        duration: 6000
      });
    },
    [addToastCtx]
  );

  return { addToast, removeToast, showLoader, hideLoader, onSuccess, onError };
};
