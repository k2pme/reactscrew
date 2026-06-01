import React from 'react';
import { act, renderHook, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToastProvider, useScrewToast } from '../src';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('ToastProvider + useScrewToast', () => {
  it('adds and removes a toast', () => {
    const { result } = renderHook(() => useScrewToast(), { wrapper });

    let id: string;
    act(() => {
      id = result.current.addToast({ message: 'Hello', variant: 'info', duration: 0 });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Hello');
    expect(result.current.toasts[0].variant).toBe('info');

    act(() => {
      result.current.removeToast(id!);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('clears all toasts', () => {
    const { result } = renderHook(() => useScrewToast(), { wrapper });

    act(() => {
      result.current.addToast({ message: 'First', variant: 'info', duration: 0 });
      result.current.addToast({ message: 'Second', variant: 'success', duration: 0 });
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('renders toasts in the DOM', () => {
    render(
      <ToastProvider>
        <ToastUser />
      </ToastProvider>
    );

    expect(screen.getByText('Test Toast')).toBeTruthy();
  });

  it('throws outside provider', () => {
    expect(() => renderHook(() => useScrewToast())).toThrow('useScrewToast');
  });
});

function ToastUser() {
  const { addToast } = useScrewToast();
  React.useEffect(() => {
    addToast({ message: 'Test Toast', variant: 'success', duration: 0 });
  }, [addToast]);
  return null;
}
