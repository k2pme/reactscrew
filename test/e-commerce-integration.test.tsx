import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DriverProvider,
  useScrewQuery,
  useScrewMutation,
  useScrewEvents,
  useScrewDevtools,
  useScrewBatch,
  useScrewWorkflow,
  ScrewDevtools
} from '../src';
import type { RequestEvent } from '../src';

// ─── Mock APIs matching FakeStoreAPI / JSONPlaceholder response shapes ───

const productsApi = vi.fn().mockImplementation(() =>
  Promise.resolve({
    data: [
      { id: 1, title: 'Laptop', price: 999, category: 'electronics', rating: { rate: 4.5, count: 120 } },
      { id: 2, title: 'Phone', price: 599, category: 'electronics', rating: { rate: 4.2, count: 80 } }
    ],
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
);

const usersApi = vi.fn().mockImplementation(() =>
  Promise.resolve({
    data: [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
      { id: 2, name: 'Bob', email: 'bob@test.com' }
    ],
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
);

const ordersApi = vi.fn().mockImplementation(() =>
  Promise.resolve({
    data: { id: 1, items: [{ productId: 1, quantity: 2 }], total: 1998, status: 'pending' },
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
);

const backends = {
  products: {
    apiInstance: productsApi,
    screws: {
      products: {
        name: 'products',
        methods: {
          list: { type: 'query' as const, route: '/products', httpMethod: 'GET' as const },
          get: { type: 'query' as const, route: '/products/1', httpMethod: 'GET' as const },
          create: { type: 'mutation' as const, route: '/products', httpMethod: 'POST' as const }
        }
      }
    }
  },
  users: {
    apiInstance: usersApi,
    screws: {
      users: {
        name: 'users',
        methods: {
          list: { type: 'query' as const, route: '/users', httpMethod: 'GET' as const },
          get: { type: 'query' as const, route: '/users/1', httpMethod: 'GET' as const }
        }
      }
    }
  },
  orders: {
    apiInstance: ordersApi,
    screws: {
      orders: {
        name: 'orders',
        methods: {
          getCart: { type: 'query' as const, route: '/cart', httpMethod: 'GET' as const },
          checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const }
        }
      }
    }
  }
};

afterEach(cleanup);

// ─── 1. QUERY ROUTING ───

describe('multi-backend query routing', () => {
  it('routes each screw to its correct backend by screw name', async () => {
    render(
      <DriverProvider backends={backends}>
        <ProductsList />
        <UsersList />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('products-data').textContent).toContain('Laptop');
      expect(screen.getByTestId('users-data').textContent).toContain('Alice');
    });

    expect(productsApi).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/products' })
    );
    expect(usersApi).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/users' })
    );
  });

  it('isolates cache between backends', async () => {
    productsApi.mockClear();
    usersApi.mockClear();
    productsApi.mockResolvedValue({
      data: [{ id: 1, title: 'Laptop', price: 999, category: 'electronics' }],
      status: 200,
      headers: {}
    });
    usersApi.mockResolvedValue({
      data: [{ id: 1, name: 'Alice', email: 'alice@test.com' }],
      status: 200,
      headers: {}
    });

    const { rerender } = render(
      <DriverProvider backends={backends}>
        <ProductsList />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('products-data').textContent).toContain('Laptop');
    });

    expect(productsApi).toHaveBeenCalledTimes(1);

    // Rerender with same products → should use cache, no new call
    rerender(
      <DriverProvider backends={backends}>
        <ProductsList />
      </DriverProvider>
    );

    expect(productsApi).toHaveBeenCalledTimes(1);
  });
});

// ─── 2. MUTATIONS ───

describe('mutation routing by backend', () => {
  it('executes mutations on the correct backend', async () => {
    const createOrderApi = vi.fn().mockResolvedValue({
      data: { id: 2, items: [], total: 0, status: 'pending' },
      status: 201,
      headers: {}
    });

    const orderBackends = {
      orders: {
        apiInstance: createOrderApi,
        screws: {
          orders: {
            name: 'orders',
            methods: {
              checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const }
            }
          }
        }
      }
    };

    let checkout: any;
    const TestComp = () => {
      const m = useScrewMutation('orders', 'checkout');
      checkout = m.mutate;
      return null;
    };

    render(
      <DriverProvider backends={orderBackends}>
        <TestComp />
      </DriverProvider>
    );

    await checkout({ cartId: 1 });

    expect(createOrderApi).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/orders', method: 'POST', data: { cartId: 1 } })
    );
  });
});

// ─── 3. CACHE ISOLATION AND REFETCH ───

describe('cache isolation', () => {
  it('stale state is per-backend', async () => {
    const apiA = vi.fn().mockResolvedValue({ data: { value: 1 }, status: 200, headers: {} });
    const apiB = vi.fn().mockResolvedValue({ data: { value: 2 }, status: 200, headers: {} });

    const TestComp = ({ backend }: { backend: string }) => {
      const { data } = useScrewQuery('service', 'get', { backend } as any);
      return <div data-testid={`data-${backend}`}>{JSON.stringify(data)}</div>;
    };

    render(
      <DriverProvider
        backends={{
          a: { apiInstance: apiA, screws: { service: { name: 'service', methods: { get: { type: 'query' as const, route: '/data', httpMethod: 'GET' as const } } } } },
          b: { apiInstance: apiB, screws: { service: { name: 'service', methods: { get: { type: 'query' as const, route: '/data', httpMethod: 'GET' as const } } } } }
        }}
      >
        <TestComp backend="a" />
        <TestComp backend="b" />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('data-a').textContent).toContain('1');
      expect(screen.getByTestId('data-b').textContent).toContain('2');
    });
  });
});

// ─── 4. EVENTS ACROSS BACKENDS ───

describe('events aggregated across backends', () => {
  it('useScrewEvents hears events from all backend clients', async () => {
    const allEvents: RequestEvent[] = [];

    const EventComp = () => {
      useScrewEvents((ev) => { allEvents.push(ev); });
      return null;
    };

    render(
      <DriverProvider backends={backends}>
        <EventComp />
        <ProductsList />
        <UsersList />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByTestId('products-data').textContent).toContain('Laptop');
      expect(screen.getByTestId('users-data').textContent).toContain('Alice');
    });

    const productEvents = allEvents.filter((e) => e.screwName === 'products');
    const userEvents = allEvents.filter((e) => e.screwName === 'users');
    expect(productEvents.length).toBeGreaterThan(0);
    expect(userEvents.length).toBeGreaterThan(0);
  });
});

// ─── 5. DEVTOOLS AGGREGATION ───

describe('devtools aggregates all backends', () => {
  it('useScrewDevtools returns data from all backends', async () => {
    let snapshot: any = null;
    const DevtoolsReader = () => {
      snapshot = useScrewDevtools();
      return null;
    };

    render(
      <DriverProvider backends={backends}>
        <DevtoolsReader />
        <ProductsList />
        <UsersList />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(snapshot).not.toBeNull();
      expect(snapshot.queries.length).toBe(2); // 2 queries across all backends
    });

    expect(snapshot.mutations).toBeDefined();
    expect(snapshot.metrics).toBeDefined();
    expect(snapshot.events.length).toBeGreaterThan(0);
  });

  it('ScrewDevtools component renders with aggregated data', async () => {
    render(
      <DriverProvider backends={backends}>
        <ScrewDevtools defaultOpen />
        <ProductsList />
      </DriverProvider>
    );

    await vi.waitFor(() => {
      expect(screen.getByText(/ReactScrew Devtools/)).toBeTruthy();
    });

    expect(screen.getAllByText(/Queries/).length).toBeGreaterThan(0);
  });
});

// ─── 6. BATCH ACROSS BACKENDS ───

describe('batch across backends', () => {
  it('executes actions on different backends', async () => {
    const batchProductsApi = vi.fn().mockResolvedValue({ data: { id: 3 }, status: 201, headers: {} });
    const batchOrdersApi = vi.fn().mockResolvedValue({ data: { id: 3 }, status: 201, headers: {} });

    const TestComp = () => {
      const { execute } = useScrewBatch([
        { screwName: 'products', methodName: 'create', variables: { title: 'Tablet' }, backend: 'products' },
        { screwName: 'orders', methodName: 'checkout', variables: { cartId: 1 }, backend: 'orders' }
      ]);
      return <button onClick={() => execute()}>RunBatch</button>;
    };

    render(
      <DriverProvider
        backends={{
          products: { apiInstance: batchProductsApi, screws: { products: { name: 'products', methods: { create: { type: 'mutation' as const, route: '/products', httpMethod: 'POST' as const } } } } },
          orders: { apiInstance: batchOrdersApi, screws: { orders: { name: 'orders', methods: { checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const } } } } }
        }}
      >
        <TestComp />
      </DriverProvider>
    );

    fireEvent.click(screen.getByText('RunBatch'));

    await vi.waitFor(() => {
      expect(batchProductsApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/products', data: { title: 'Tablet' } })
      );
      expect(batchOrdersApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/orders', data: { cartId: 1 } })
      );
    });
  });
});

// ─── 7. WORKFLOW ACROSS BACKENDS ───

describe('workflow across backends', () => {
  it('executes multi-backend workflow steps', async () => {
    const wfProductsApi = vi.fn().mockResolvedValue({ data: { id: 4 }, status: 201, headers: {} });
    const wfOrdersApi = vi.fn().mockResolvedValue({ data: { id: 4 }, status: 201, headers: {} });

    const TestComp = () => {
      const { execute } = useScrewWorkflow({
        steps: [
          {
            id: 'create-product',
            screwName: 'products',
            methodName: 'create',
            variables: { title: 'Mouse' },
            backend: 'backend-products'
          },
          {
            id: 'create-order',
            screwName: 'orders',
            methodName: 'checkout',
            variables: { cartId: 1 },
            dependsOn: ['create-product'],
            backend: 'backend-orders'
          }
        ]
      });
      return <button onClick={() => execute()}>RunWorkflow</button>;
    };

    render(
      <DriverProvider
        backends={{
          'backend-products': { apiInstance: wfProductsApi, screws: { products: { name: 'products', methods: { create: { type: 'mutation' as const, route: '/products', httpMethod: 'POST' as const } } } } },
          'backend-orders': { apiInstance: wfOrdersApi, screws: { orders: { name: 'orders', methods: { checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const } } } } }
        }}
      >
        <TestComp />
      </DriverProvider>
    );

    fireEvent.click(screen.getByText('RunWorkflow'));

    await vi.waitFor(() => {
      expect(wfProductsApi).toHaveBeenCalledTimes(1);
      expect(wfOrdersApi).toHaveBeenCalledTimes(1);
    });
  });
});

// ─── 8. REAL-WORLD SCENARIO: E-commerce checkout flow ───

describe('e-commerce checkout flow across 3 backends', () => {
  it('completes a full product→cart→order flow', async () => {
    const flowProductsApi = vi.fn().mockResolvedValue({ data: { id: 5, title: 'Monitor', price: 299 }, status: 200, headers: {} });
    const flowCartApi = vi.fn().mockResolvedValue({ data: { id: 1, items: [{ productId: 5, quantity: 1 }], total: 299 }, status: 200, headers: {} });
    const flowOrdersApi = vi.fn().mockResolvedValue({ data: { id: 10, items: [{ productId: 5, quantity: 1 }], total: 299, status: 'confirmed' }, status: 201, headers: {} });

    const flowBackends = {
      products: {
        apiInstance: flowProductsApi,
        clientOptions: {},
        screws: {
          catalog: {
            name: 'catalog',
            methods: {
              getProduct: { type: 'query' as const, route: '/products/5', httpMethod: 'GET' as const },
              updateStock: { type: 'mutation' as const, route: '/products/5', httpMethod: 'PATCH' as const }
            }
          }
        }
      },
      cart: {
        apiInstance: flowCartApi,
        screws: {
          cart: {
            name: 'cart',
            methods: {
              getCart: { type: 'query' as const, route: '/cart', httpMethod: 'GET' as const },
              addItem: { type: 'mutation' as const, route: '/cart', httpMethod: 'POST' as const }
            }
          }
        }
      },
      orders: {
        apiInstance: flowOrdersApi,
        screws: {
          orders: {
            name: 'orders',
            methods: {
              checkout: { type: 'mutation' as const, route: '/orders', httpMethod: 'POST' as const },
              getOrder: { type: 'query' as const, route: '/orders/10', httpMethod: 'GET' as const }
            }
          }
        }
      }
    };

    let checkoutMutate: any;
    const CheckoutFlow = () => {
      const product = useScrewQuery('catalog', 'getProduct');
      const cart = useScrewQuery('cart', 'getCart');
      const checkout = useScrewMutation('orders', 'checkout');
      checkoutMutate = checkout.mutate;

      return (
        <div>
          <div data-testid="product">{JSON.stringify(product.data)}</div>
          <div data-testid="cart">{JSON.stringify(cart.data)}</div>
        </div>
      );
    };

    render(
      <DriverProvider backends={flowBackends}>
        <CheckoutFlow />
      </DriverProvider>
    );

    // Products and cart load independently
    await vi.waitFor(() => {
      expect(flowProductsApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/products/5' })
      );
      expect(flowCartApi).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/cart' })
      );
    });

    expect(screen.getByTestId('product').textContent).toContain('Monitor');
    expect(screen.getByTestId('cart').textContent).toContain('299');

    // Checkout uses the orders backend
    await checkoutMutate({ cartId: 1 });

    expect(flowOrdersApi).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/orders', method: 'POST', data: { cartId: 1 } })
    );
  });
});

// ─── Helper components ───

const ProductsList = () => {
  const { data, isLoading } = useScrewQuery('products', 'list');
  return (
    <div data-testid="products-data">
      {isLoading ? 'loading...' : JSON.stringify(data)}
    </div>
  );
};

const UsersList = () => {
  const { data, isLoading } = useScrewQuery('users', 'list');
  return (
    <div data-testid="users-data">
      {isLoading ? 'loading...' : JSON.stringify(data)}
    </div>
  );
};
