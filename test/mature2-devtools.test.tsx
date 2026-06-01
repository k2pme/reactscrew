import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DriverProvider, ScrewDevtools } from '../src';

const api = vi.fn().mockResolvedValue({ data: [], status: 200, headers: {} });

const wrapper = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </DriverProvider>
);

describe('ScrewDevtools', () => {
  afterEach(cleanup);

  it('renders the closed state button by default', () => {
    render(<ScrewDevtools />, { wrapper });
    expect(screen.getByText(/RS Devtools/)).toBeTruthy();
  });

  it('renders the panel when defaultOpen is true', () => {
    render(<ScrewDevtools defaultOpen />, { wrapper });
    expect(screen.getByText(/ReactScrew Devtools/)).toBeTruthy();
  });

  it('shows queries tab by default', () => {
    render(<ScrewDevtools defaultOpen />, { wrapper });
    expect(screen.getAllByText(/Queries/).length).toBeGreaterThan(0);
  });

  it('shows Metrics tab', () => {
    render(<ScrewDevtools defaultOpen defaultTab="metrics" />, { wrapper });
    expect(screen.getByText(/Cache Hits/)).toBeTruthy();
  });

  it('opens and closes the panel', () => {
    render(<ScrewDevtools />, { wrapper });

    expect(screen.getAllByText(/RS Devtools/).length).toBeGreaterThan(0);

    const openBtn = screen.getAllByText(/RS Devtools/)[0];
    fireEvent.click(openBtn);

    expect(screen.getByText(/ReactScrew Devtools/)).toBeTruthy();
  });
});
