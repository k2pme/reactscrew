import type { DocumentedErrorDefinition } from 'reactscrew';

export const generatedErrorCatalog = {
  GetCart: [
  ],
  AddToCart: [
  ],
  UpdateCartItem: [
  ],
  RemoveFromCart: [
  ],
  ListOrders: [
  ],
  Checkout: [
    { status: "400", code: "CHECKOUT_400", description: "Invalid cart", retryable: false, uiHint: "error" },
  ],
  GetOrder: [
  ],
} as const;

export const GetCartErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.GetCart as unknown as DocumentedErrorDefinition[];
export const AddToCartErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.AddToCart as unknown as DocumentedErrorDefinition[];
export const UpdateCartItemErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.UpdateCartItem as unknown as DocumentedErrorDefinition[];
export const RemoveFromCartErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.RemoveFromCart as unknown as DocumentedErrorDefinition[];
export const ListOrdersErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.ListOrders as unknown as DocumentedErrorDefinition[];
export const CheckoutErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.Checkout as unknown as DocumentedErrorDefinition[];
export const GetOrderErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.GetOrder as unknown as DocumentedErrorDefinition[];
