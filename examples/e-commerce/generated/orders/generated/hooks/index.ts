import { useScrewMutation, useScrewQuery } from 'reactscrew';
import type { QueryObserverOptions, UseScrewMutationOptions } from 'reactscrew';
import type {
  GetCartParams,
  GetCartResponse,
  AddToCartParams,
  AddToCartBody,
  AddToCartResponse,
  UpdateCartItemParams,
  UpdateCartItemBody,
  UpdateCartItemResponse,
  RemoveFromCartParams,
  RemoveFromCartResponse,
  ListOrdersParams,
  ListOrdersResponse,
  CheckoutParams,
  CheckoutBody,
  CheckoutResponse,
  GetOrderParams,
  GetOrderResponse,
} from '../types';

export const useGetCartQuery = (
  params?: GetCartParams,
  options?: Omit<QueryObserverOptions<[GetCartParams], GetCartResponse>, 'args'>
) =>
  useScrewQuery<GetCartResponse>("cart", "getCart", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useAddToCartMutation = (
  options?: UseScrewMutationOptions<AddToCartResponse, AddToCartBody>
) => {
  const mutation = useScrewMutation<AddToCartResponse, AddToCartBody>(
    "cart",
    "addToCart",
    options
  );

  return {
    ...mutation,
    mutate: (body?: AddToCartBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: AddToCartBody) =>
      mutation.mutateAsync(body)
  };
};

export const useUpdateCartItemMutation = (
  options?: UseScrewMutationOptions<UpdateCartItemResponse, UpdateCartItemBody>
) => {
  const mutation = useScrewMutation<UpdateCartItemResponse, UpdateCartItemBody>(
    "cart",
    "updateCartItem",
    options
  );

  return {
    ...mutation,
    mutate: (body: UpdateCartItemBody, params?: UpdateCartItemParams) =>
      mutation.mutate(body, params),
    mutateAsync: (body: UpdateCartItemBody, params?: UpdateCartItemParams) =>
      mutation.mutateAsync(body, params)
  };
};

export const useRemoveFromCartMutation = (
  options?: UseScrewMutationOptions<RemoveFromCartResponse, unknown>
) => {
  const mutation = useScrewMutation<RemoveFromCartResponse, unknown>(
    "cart",
    "removeFromCart",
    options
  );

  return {
    ...mutation,
    mutate: (body: unknown, params?: RemoveFromCartParams) =>
      mutation.mutate(body, params),
    mutateAsync: (body: unknown, params?: RemoveFromCartParams) =>
      mutation.mutateAsync(body, params)
  };
};

export const useListOrdersQuery = (
  params?: ListOrdersParams,
  options?: Omit<QueryObserverOptions<[ListOrdersParams], ListOrdersResponse>, 'args'>
) =>
  useScrewQuery<ListOrdersResponse>("orders", "listOrders", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useCheckoutMutation = (
  options?: UseScrewMutationOptions<CheckoutResponse, CheckoutBody>
) => {
  const mutation = useScrewMutation<CheckoutResponse, CheckoutBody>(
    "orders",
    "checkout",
    options
  );

  return {
    ...mutation,
    mutate: (body?: CheckoutBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: CheckoutBody) =>
      mutation.mutateAsync(body)
  };
};

export const useGetOrderQuery = (
  params: GetOrderParams,
  options?: Omit<QueryObserverOptions<[GetOrderParams], GetOrderResponse>, 'args'>
) =>
  useScrewQuery<GetOrderResponse>("orders", "getOrder", {
    ...options,
    args: params === undefined ? [] : [params]
  });
