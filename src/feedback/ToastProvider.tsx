'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';
import type { Toast, ToastConfig, ToastVariant } from './types';

let toastIdCounter = 0;

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

const toastReducer = (state: Toast[], action: ToastAction): Toast[] => {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast];
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    case 'CLEAR':
      return [];
  }
};

const defaultStyle: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 400
  },
  toast: {
    padding: '12px 16px',
    borderRadius: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    lineHeight: 1.4,
    cursor: 'pointer',
    transition: 'opacity 0.2s'
  },
  closeBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    opacity: 0.6
  }
};

const variantColors: Record<ToastVariant, string> = {
  success: '#e6f7e6',
  error: '#ffe6e6',
  info: '#e6f0ff',
  warning: '#fff3e6'
};

const variantTextColors: Record<ToastVariant, string> = {
  success: '#1a7d1a',
  error: '#cc0000',
  info: '#0066cc',
  warning: '#cc7a00'
};

export const ToastProvider = ({
  children,
  position = 'top-right',
  duration: defaultDuration = 5000,
  maxToasts = 5,
  renderToast
}: ToastConfig & {
  children: ReactNode;
  renderToast?: (toast: Toast, onRemove: () => void) => ReactNode;
}) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const addToast = useCallback(
    (input: Omit<Toast, 'id' | 'createdAt'> & { id?: string; createdAt?: number }): string => {
      const id = input.id ?? `toast-${++toastIdCounter}`;
      const toast: Toast = {
        ...input,
        duration: input.duration ?? defaultDuration,
        id,
        createdAt: input.createdAt ?? Date.now()
      };
      dispatch({ type: 'ADD', toast });

      if (toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration);
      }

      return id;
    },
    [removeToast]
  );

  const value = useMemo(
    () => ({ toasts, addToast, removeToast, clearToasts }),
    [toasts, addToast, removeToast, clearToasts]
  );

  const positionStyle: React.CSSProperties =
    position === 'top-center'
      ? { ...defaultStyle.container, left: '50%', transform: 'translateX(-50%)', right: 'auto' }
      : position === 'top-left'
        ? { ...defaultStyle.container, right: 'auto', left: 16 }
        : position === 'bottom-right'
          ? { ...defaultStyle.container, top: 'auto', bottom: 16 }
          : position === 'bottom-left'
            ? { ...defaultStyle.container, top: 'auto', bottom: 16, right: 'auto', left: 16 }
            : position === 'bottom-center'
              ? { ...defaultStyle.container, top: 'auto', bottom: 16, left: '50%', transform: 'translateX(-50%)', right: 'auto' }
              : defaultStyle.container;

  const visibleToasts = toasts.slice(-maxToasts);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={positionStyle}>
        {visibleToasts.map((toast) =>
          renderToast ? (
            renderToast(toast, () => removeToast(toast.id))
          ) : (
            <div
              key={toast.id}
              style={{
                ...defaultStyle.toast,
                backgroundColor: variantColors[toast.variant],
                color: variantTextColors[toast.variant]
              }}
              onClick={() => removeToast(toast.id)}
              role="alert"
            >
              {toast.icon}
              <span>{toast.message}</span>
              {toast.action && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.action!.onClick();
                    removeToast(toast.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    color: variantTextColors[toast.variant]
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
                style={defaultStyle.closeBtn}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useScrewToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useScrewToast must be used within a <ToastProvider>');
  }
  return ctx;
};
