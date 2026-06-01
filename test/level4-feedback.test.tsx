import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DriverProvider, FeedbackProvider, useScrewFeedback, useScrewToast, useScrewLoader } from '../src';

const api = vi.fn().mockResolvedValue({ data: [{ id: 1 }], status: 200, headers: {} });

const feedbackWrapper = ({ children }: { children: React.ReactNode }) => (
  <DriverProvider
    apiInstance={api}
    screws={{
      user: {
        name: 'user',
        methods: {
          list: { type: 'query', route: '/users', httpMethod: 'GET' }
        }
      }
    }}
    clientOptions={{}}
  >
    <FeedbackProvider
      config={{
        toasts: { onSuccess: true, onError: true, defaultDuration: 0 },
        loaders: { enabled: true, defaultVariant: 'spinner', policy: { minDuration: 0 } }
      }}
    >
      {children}
    </FeedbackProvider>
  </DriverProvider>
);

describe('useScrewFeedback', () => {
  it('adds and removes a toast', () => {
    const { result } = renderHook(() => useScrewFeedback(), { wrapper: feedbackWrapper });

    let id: string;
    act(() => {
      id = result.current.addToast('Feedback test');
    });

    act(() => {
      result.current.removeToast(id!);
    });
  });

  it('onSuccess adds a success toast', () => {
    const { result } = renderHook(
      () => ({ feedback: useScrewFeedback(), toast: useScrewToast() }),
      { wrapper: feedbackWrapper }
    );

    act(() => {
      result.current.feedback.onSuccess('Operation completed');
    });

    expect(result.current.toast.toasts).toHaveLength(1);
    expect(result.current.toast.toasts[0].variant).toBe('success');
  });

  it('onError adds an error toast', () => {
    const { result } = renderHook(
      () => ({ feedback: useScrewFeedback(), toast: useScrewToast() }),
      { wrapper: feedbackWrapper }
    );

    act(() => {
      result.current.feedback.onError({ message: 'Something failed', code: 'ERR_01' });
    });

    expect(result.current.toast.toasts).toHaveLength(1);
    expect(result.current.toast.toasts[0].variant).toBe('error');
  });

  it('shows and hides loader via feedback', () => {
    const { result } = renderHook(
      () => ({ feedback: useScrewFeedback(), loader: useScrewLoader() }),
      { wrapper: feedbackWrapper }
    );

    act(() => {
      result.current.feedback.showLoader('op1', 'spinner', 'Loading...');
    });

    expect(result.current.loader.isLoading).toBe(true);
    expect(result.current.loader.loaders['op1']).toBeDefined();

    act(() => {
      result.current.feedback.hideLoader('op1');
    });

    expect(result.current.loader.isLoading).toBe(false);
  });
});
