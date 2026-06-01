import type { ReactNode } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
  createdAt: number;
}

export interface ToastConfig {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number;
  maxToasts?: number;
}

export interface ToastErrorMapping {
  code?: string;
  status?: number;
  message?: string;
  variant?: ToastVariant;
  duration?: number;
}

export type LoaderVariant = 'spinner' | 'skeleton' | 'progress' | 'shimmer' | 'overlay';

export interface LoaderPolicy {
  minDuration?: number;
  variant?: LoaderVariant;
}

export interface LoaderState {
  active: boolean;
  variant: LoaderVariant;
  message?: string;
}

export interface FeedbackConfig {
  toasts?: {
    onSuccess?: boolean | { message?: string; duration?: number };
    onError?: boolean | ToastErrorMapping[];
    defaultDuration?: number;
    position?: ToastConfig['position'];
    maxToasts?: number;
  };
  loaders?: {
    enabled?: boolean;
    defaultVariant?: LoaderVariant;
    policy?: LoaderPolicy;
  };
}
