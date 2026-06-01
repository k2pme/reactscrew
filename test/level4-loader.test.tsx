import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoaderProvider, useScrewLoader } from '../src';

const instantWrapper = ({ children }: { children: React.ReactNode }) => (
  <LoaderProvider defaultVariant="spinner" policy={{ minDuration: 0 }}>{children}</LoaderProvider>
);

const delayedWrapper = ({ children }: { children: React.ReactNode }) => (
  <LoaderProvider defaultVariant="spinner" policy={{ minDuration: 150 }}>{children}</LoaderProvider>
);

describe('LoaderProvider + useScrewLoader', () => {
  it('shows and hides a loader', () => {
    const { result } = renderHook(() => useScrewLoader(), { wrapper: instantWrapper });

    act(() => {
      result.current.showLoader('test', 'spinner', 'Loading...');
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.loaders['test']).toBeDefined();
    expect(result.current.loaders['test'].variant).toBe('spinner');

    act(() => {
      result.current.hideLoader('test');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loaders['test']).toBeUndefined();
  });

  it('supports multiple loaders', () => {
    const { result } = renderHook(() => useScrewLoader(), { wrapper: instantWrapper });

    act(() => {
      result.current.showLoader('a', 'spinner');
      result.current.showLoader('b', 'skeleton');
    });

    expect(result.current.isLoading).toBe(true);
    expect(Object.keys(result.current.loaders)).toHaveLength(2);

    act(() => {
      result.current.hideLoader('a');
    });

    expect(result.current.isLoading).toBe(true);
    expect(Object.keys(result.current.loaders)).toHaveLength(1);
  });

  it('does not show loader before minDuration', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useScrewLoader(), { wrapper: delayedWrapper });

    act(() => {
      result.current.showLoader('fast', 'spinner');
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.hideLoader('fast');
    });

    expect(result.current.isLoading).toBe(false);
    vi.useRealTimers();
  });

  it('throws outside provider', () => {
    expect(() => renderHook(() => useScrewLoader())).toThrow('useScrewLoader');
  });
});
