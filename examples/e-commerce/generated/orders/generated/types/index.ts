export type Cart = {
  id?: number;
  items?: Array<CartItem>;
  total?: number;
};

export type CartItem = {
  id?: number;
  productId?: number;
  quantity?: number;
  price?: number;
};

export type AddCartItemInput = {
  productId: number;
  quantity: number;
};

export type UpdateCartItemInput = {
  quantity?: number;
};

export type Order = {
  id?: number;
  items?: Array<CartItem>;
  total?: number;
  status?: "pending" | "confirmed" | "shipped" | "delivered";
  createdAt?: string;
};

export type CheckoutInput = {
  cartId: number;
  shippingAddress?: string;
};

export type GetCartParams = Record<string, never>;
export type GetCartResponse = Cart;
export type GetCartError =
  never;

export type AddToCartParams = Record<string, never>;
export type AddToCartBody = AddCartItemInput;
export type AddToCartResponse = Cart;
export type AddToCartError =
  never;

export type UpdateCartItemParams = {
  itemId: number;
};
export type UpdateCartItemBody = UpdateCartItemInput;
export type UpdateCartItemResponse = Cart;
export type UpdateCartItemError =
  never;

export type RemoveFromCartParams = {
  itemId: number;
};
export type RemoveFromCartResponse = unknown;
export type RemoveFromCartError =
  never;

export type ListOrdersParams = Record<string, never>;
export type ListOrdersResponse = Array<Order>;
export type ListOrdersError =
  never;

export type CheckoutParams = Record<string, never>;
export type CheckoutBody = CheckoutInput;
export type CheckoutResponse = Order;
export type CheckoutError =
  | {
      status: "400";
      code: "CHECKOUT_400";
      description?: "Invalid cart";
      retryable?: false;
      uiHint?: "error";
      data?: unknown;
    };

export type GetOrderParams = {
  orderId: number;
};
export type GetOrderResponse = Order;
export type GetOrderError =
  never;
