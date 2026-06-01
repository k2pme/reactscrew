import type { ScrewsMap } from 'reactscrew';
import type {
  GetCartParams,
  AddToCartParams,
  UpdateCartItemParams,
  RemoveFromCartParams,
  ListOrdersParams,
  CheckoutParams,
  GetOrderParams,
} from '../types';
import {
  validateGetCartResponse,
  validateAddToCartBody,
  validateAddToCartResponse,
  validateUpdateCartItemParamsArgs,
  validateUpdateCartItemBody,
  validateUpdateCartItemResponse,
  validateRemoveFromCartParamsArgs,
  validateListOrdersResponse,
  validateCheckoutBody,
  validateCheckoutResponse,
  validateGetOrderParamsArgs,
  validateGetOrderResponse,
} from '../validators';
import {
  CheckoutErrors,
} from '../errors';

export const cartScrew = {
  name: "cart",
  methods: {
    getCart: {
      type: 'query',
      route: "/cart",
      httpMethod: 'GET',
      responseValidator: validateGetCartResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "Get current cart"
    },
    addToCart: {
      type: 'mutation',
      route: "/cart",
      httpMethod: 'POST',
      bodyValidator: validateAddToCartBody,
      responseValidator: validateAddToCartResponse,
      description: "Add item to cart"
    },
    updateCartItem: {
      type: 'mutation',
      route: (params: UpdateCartItemParams) => `/cart/\${encodeURIComponent(String(params.itemId))}`,
      httpMethod: 'PATCH',
      paramsValidator: validateUpdateCartItemParamsArgs,
      bodyValidator: validateUpdateCartItemBody,
      responseValidator: validateUpdateCartItemResponse,
      description: "Update cart item quantity"
    },
    removeFromCart: {
      type: 'mutation',
      route: (params: RemoveFromCartParams) => `/cart/\${encodeURIComponent(String(params.itemId))}`,
      httpMethod: 'DELETE',
      paramsValidator: validateRemoveFromCartParamsArgs,
      description: "Remove item from cart"
    }
  }
};

export const ordersScrew = {
  name: "orders",
  methods: {
    listOrders: {
      type: 'query',
      route: "/orders",
      httpMethod: 'GET',
      responseValidator: validateListOrdersResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "List user orders"
    },
    checkout: {
      type: 'mutation',
      route: "/orders",
      httpMethod: 'POST',
      bodyValidator: validateCheckoutBody,
      responseValidator: validateCheckoutResponse,
      documentedErrors: CheckoutErrors,
      description: "Checkout and create order"
    },
    getOrder: {
      type: 'query',
      route: (params: GetOrderParams) => `/orders/\${encodeURIComponent(String(params.orderId))}`,
      httpMethod: 'GET',
      paramsValidator: validateGetOrderParamsArgs,
      responseValidator: validateGetOrderResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "Get order by ID"
    }
  }
};

export const generatedScrews = {
  cart: cartScrew,
  orders: ordersScrew,
};

export const screws = generatedScrews satisfies ScrewsMap;
