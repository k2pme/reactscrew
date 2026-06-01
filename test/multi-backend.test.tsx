import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DriverProvider, useScrewQuery, useScrewMutation, useScrewBatch, useScrewEvents } from '../src';
import type { RequestEvent } from '../src';

const usersApi = vi.fn().mockResolvedValue({ data: [{ id: 1, name: 'Alice' }], status: 200, headers: {} });
const ordersApi = vi.fn().mockResolvedValue({ data: [{ id: 1, total: 100 }], status: 200, headers: {} });
const billingApi = vi.fn().mockResolvedValue({ data: [{ id: 1, amount: 50 }], status: 200, headers: {} });

const backends = {
  users: {
    apiInstance: usersApi,
    screws: {
      user: {
        name: 'user',
        methods: {
          list: { type: 'query' as const, route: '/users', httpMethod: 'GET' as const }
        }
      }
    }
  },
  orders: {
    apiInstance: ordersApi,
    screws: {
      order: {
        name: 'order',
        methods: {
          list: { type: 'query' as const, route: '/orders', httpMethod: 'GET' as const }
        }
      }
    }
  },
  billing: {
    apiInstance: billingApi,
    screws: {
      invoice: {
        name: 'invoice',
        methods: {
          list: { type: 'query' as const, route: '/invoices', httpMethod: 'GET' as const }
        }
      }
    }
  }
};

const multiBackends = {
  api: {
    apiInstance: billingApi,
    screws: {
      billing: {
        name: 'billing',
        methods: {
          list: { type: 'query' as const, route: '/billing', httpMethod: 'GET' as const }
        }
      }
    }
  },
  legacy: {
    apiInstance: ordersApi,
    screws: {
      order: {
        name: 'order',
        methods: {
          list: { type: 'query' as const, route: '/orders', httpMethod: 'GET' as const }
        }
      }
    }
  }
};

afterEach(cleanup);

describe('multi-backend with backends prop', () => {
  it('routes queries to the correct backend automatically by screw name', async () => {
    const TestComp = ({ screwName }: { screwName: string }) => {
      const { data } = useScrewQuery(screwName, 'list');
      return <div data-testid={`data-${screwName}`}>{JSON.stringify(data)}</div>;
    };

    render(
      <DriverProvider backends={backends}>
        <TestComp screwName="user" />
        <TestComp screwName="order" />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('data-user').textContent).toContain('Alice');
      expect(screen.getByTestId('data-order').textContent).toContain('100');
    });

    expect(usersApi).toHaveBeenCalled();
    expect(ordersApi).toHaveBeenCalled();
    expect(billingApi).not.toHaveBeenCalled();
  });

  it('routes queries to explicit backend via options.backend', async () => {
    const TestComp = ({ screwName, backend }: { screwName: string; backend: string }) => {
      const { data } = useScrewQuery(screwName, 'list', { backend } as any);
      return <div data-testid={`data-${screwName}`}>{JSON.stringify(data)}</div>;
    };

    render(
      <DriverProvider backends={backends}>
        <TestComp screwName="user" backend="users" />
        <TestComp screwName="order" backend="orders" />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('data-user').textContent).toContain('Alice');
      expect(screen.getByTestId('data-order').textContent).toContain('100');
    });
  });

  it('isolates cache between backends', async () => {
    usersApi.mockClear();
    ordersApi.mockClear();
    usersApi.mockResolvedValue({ data: [{ id: 1, name: 'Alice' }], status: 200, headers: {} });
    ordersApi.mockResolvedValue({ data: [{ id: 1, total: 100 }], status: 200, headers: {} });

    const TestComp = ({ screwName, method, backend }: { screwName: string; method: string; backend: string }) => {
      const { data } = useScrewQuery(screwName, method, { backend } as any);
      return <div data-testid={`data-${screwName}`}>{JSON.stringify(data)}</div>;
    };

    const { rerender } = render(
      <DriverProvider backends={backends}>
        <TestComp screwName="user" method="list" backend="users" />
        <TestComp screwName="order" method="list" backend="orders" />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('data-user').textContent).toContain('Alice');
      expect(screen.getByTestId('data-order').textContent).toContain('100');
    });

    expect(usersApi).toHaveBeenCalledTimes(1);
    expect(ordersApi).toHaveBeenCalledTimes(1);

    rerender(
      <DriverProvider backends={backends}>
        <TestComp screwName="user" method="list" backend="users" />
      </DriverProvider>
    );

    expect(screen.getByTestId('data-user').textContent).toContain('Alice');
    expect(usersApi).toHaveBeenCalledTimes(1);
  });

  it('supports mutations routed by backend', async () => {
    const createUserApi = vi.fn().mockResolvedValue({ data: { id: 2, name: 'Bob' }, status: 201, headers: {} });
    const customBackends = {
      users: {
        apiInstance: createUserApi,
        screws: {
          user: {
            name: 'user',
            methods: {
              create: { type: 'mutation' as const, route: '/users', httpMethod: 'POST' as const }
            }
          }
        }
      }
    };

    let mutate: any;
    const TestComp = () => {
      const m = useScrewMutation('user', 'create');
      mutate = m.mutate;
      return null;
    };

    render(
      <DriverProvider backends={customBackends}>
        <TestComp />
      </DriverProvider>
    );

    await mutate({ name: 'Bob' });
    expect(createUserApi).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/users', method: 'POST' })
    );
  });
});

describe('multi-backend with mixed backends + apiInstance/screws', () => {
  it('supports legacy apiInstance + screws alongside backends prop', async () => {
    const legacyApi = vi.fn().mockResolvedValue({ data: [{ id: 1, msg: 'legacy' }], status: 200, headers: {} });

    const TestComp = ({ screwName }: { screwName: string }) => {
      const { data } = useScrewQuery(screwName, 'list');
      return <div data-testid={`data-${screwName}`}>{JSON.stringify(data)}</div>;
    };

    render(
      <DriverProvider
        apiInstance={legacyApi}
        screws={{
          legacy: {
            name: 'legacy',
            methods: {
              list: { type: 'query' as const, route: '/legacy', httpMethod: 'GET' as const }
            }
          }
        }}
        backends={multiBackends}
      >
        <TestComp screwName="billing" />
        <TestComp screwName="order" />
        <TestComp screwName="legacy" />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('data-billing').textContent).toContain('50');
      expect(screen.getByTestId('data-order').textContent).toContain('100');
      expect(screen.getByTestId('data-legacy').textContent).toContain('legacy');
    });
  });
});

describe('multi-backend events', () => {
  it('aggregates events across all backend clients', async () => {
    const allEvents: RequestEvent[] = [];

    const EventListener = () => {
      useScrewEvents((ev) => { allEvents.push(ev); });
      return null;
    };

    const UserQuery = () => {
      const { data } = useScrewQuery('user', 'list');
      return <div data-testid="user-data">{JSON.stringify(data)}</div>;
    };

    const OrderQuery = () => {
      const { data } = useScrewQuery('order', 'list');
      return <div data-testid="order-data">{JSON.stringify(data)}</div>;
    };

    render(
      <DriverProvider
        apiInstance={vi.fn().mockResolvedValue({ data: [], status: 200, headers: {} })}
        screws={{}}
        backends={backends}
      >
        <EventListener />
        <UserQuery />
        <OrderQuery />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('user-data').textContent).toContain('Alice');
      expect(screen.getByTestId('order-data').textContent).toContain('100');
    });

    const userEvents = allEvents.filter((e) => e.screwName === 'user');
    const orderEvents = allEvents.filter((e) => e.screwName === 'order');
    expect(userEvents.length).toBeGreaterThan(0);
    expect(orderEvents.length).toBeGreaterThan(0);
  });
});

describe('multi-backend with useScrewBatch', () => {
  it('routes batch actions by screw name', async () => {
    const batchUsersApi = vi.fn().mockResolvedValue({ data: { id: 1 }, status: 201, headers: {} });
    const batchOrdersApi = vi.fn().mockResolvedValue({ data: { id: 1 }, status: 201, headers: {} });

    const TestComp = () => {
      const { execute, isExecuting } = useScrewBatch([
        { screwName: 'user', methodName: 'create', variables: { name: 'A' }, backend: 'users' },
        { screwName: 'order', methodName: 'create', variables: { total: 50 }, backend: 'orders' }
      ]);
      return (
        <div>
          <button onClick={() => execute()} disabled={isExecuting}>Run</button>
          <span data-testid="executing">{isExecuting ? 'yes' : 'no'}</span>
        </div>
      );
    };

    render(
      <DriverProvider
        backends={{
          users: {
            apiInstance: batchUsersApi,
            screws: {
              user: {
                name: 'user',
                methods: {
                  create: { type: 'mutation' as const, route: '/users', httpMethod: 'POST' as const }
                }
              }
            }
          },
          orders: {
            apiInstance: batchOrdersApi,
            screws: {
              order: {
                name: 'order',
                methods: {
                  create: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const }
                }
              }
            }
          }
        }}
      >
        <TestComp />
      </DriverProvider>
    );

    fireEvent.click(screen.getByText('Run'));

    await vi.waitFor(() => {
      expect(batchUsersApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/users', method: 'POST' })
      );
      expect(batchOrdersApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/orders', method: 'POST' })
      );
    });
  });
});
