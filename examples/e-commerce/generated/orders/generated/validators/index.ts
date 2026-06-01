import { createSchemaValidator } from 'reactscrew';
import type { RuntimeValidator } from 'reactscrew';
import type {
  GetCartParams,
  GetCartResponse,
  AddToCartParams,
  AddToCartResponse,
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemResponse,
  UpdateCartItemBody,
  RemoveFromCartParams,
  RemoveFromCartResponse,
  ListOrdersParams,
  ListOrdersResponse,
  CheckoutParams,
  CheckoutResponse,
  CheckoutBody,
  GetOrderParams,
  GetOrderResponse,
} from '../types';

const GetCartResponseSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "productId": {
            "type": "integer"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number"
          }
        }
      }
    },
    "total": {
      "type": "number"
    }
  }
} as const;
export const validateGetCartResponse = createSchemaValidator<GetCartResponse>(GetCartResponseSchema, "getCart response");

const AddToCartBodySchema = {
  "type": "object",
  "properties": {
    "productId": {
      "type": "integer"
    },
    "quantity": {
      "type": "integer"
    }
  },
  "required": [
    "productId",
    "quantity"
  ]
} as const;
export const validateAddToCartBody = createSchemaValidator<AddToCartBody>(AddToCartBodySchema, "addToCart body");

const AddToCartResponseSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "productId": {
            "type": "integer"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number"
          }
        }
      }
    },
    "total": {
      "type": "number"
    }
  }
} as const;
export const validateAddToCartResponse = createSchemaValidator<AddToCartResponse>(AddToCartResponseSchema, "addToCart response");

const UpdateCartItemParamsSchema = {
  "type": "object",
  "required": [
    "itemId"
  ],
  "properties": {
    "itemId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateUpdateCartItemParams = createSchemaValidator<UpdateCartItemParams>(UpdateCartItemParamsSchema, "updateCartItem params");
export const validateUpdateCartItemParamsArgs: RuntimeValidator<[UpdateCartItemParams]> = (args) => {
  const [params] = args;
  return [validateUpdateCartItemParams((params ?? {}) as UpdateCartItemParams)];
};

const UpdateCartItemBodySchema = {
  "type": "object",
  "properties": {
    "quantity": {
      "type": "integer"
    }
  }
} as const;
export const validateUpdateCartItemBody = createSchemaValidator<UpdateCartItemBody>(UpdateCartItemBodySchema, "updateCartItem body");

const UpdateCartItemResponseSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "productId": {
            "type": "integer"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number"
          }
        }
      }
    },
    "total": {
      "type": "number"
    }
  }
} as const;
export const validateUpdateCartItemResponse = createSchemaValidator<UpdateCartItemResponse>(UpdateCartItemResponseSchema, "updateCartItem response");

const RemoveFromCartParamsSchema = {
  "type": "object",
  "required": [
    "itemId"
  ],
  "properties": {
    "itemId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateRemoveFromCartParams = createSchemaValidator<RemoveFromCartParams>(RemoveFromCartParamsSchema, "removeFromCart params");
export const validateRemoveFromCartParamsArgs: RuntimeValidator<[RemoveFromCartParams]> = (args) => {
  const [params] = args;
  return [validateRemoveFromCartParams((params ?? {}) as RemoveFromCartParams)];
};

const ListOrdersResponseSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer"
      },
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": {
              "type": "integer"
            },
            "productId": {
              "type": "integer"
            },
            "quantity": {
              "type": "integer"
            },
            "price": {
              "type": "number"
            }
          }
        }
      },
      "total": {
        "type": "number"
      },
      "status": {
        "type": "string",
        "enum": [
          "pending",
          "confirmed",
          "shipped",
          "delivered"
        ]
      },
      "createdAt": {
        "type": "string"
      }
    }
  }
} as const;
export const validateListOrdersResponse = createSchemaValidator<ListOrdersResponse>(ListOrdersResponseSchema, "listOrders response");

const CheckoutBodySchema = {
  "type": "object",
  "properties": {
    "cartId": {
      "type": "integer"
    },
    "shippingAddress": {
      "type": "string"
    }
  },
  "required": [
    "cartId"
  ]
} as const;
export const validateCheckoutBody = createSchemaValidator<CheckoutBody>(CheckoutBodySchema, "checkout body");

const CheckoutResponseSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "productId": {
            "type": "integer"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number"
          }
        }
      }
    },
    "total": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "confirmed",
        "shipped",
        "delivered"
      ]
    },
    "createdAt": {
      "type": "string"
    }
  }
} as const;
export const validateCheckoutResponse = createSchemaValidator<CheckoutResponse>(CheckoutResponseSchema, "checkout response");

const GetOrderParamsSchema = {
  "type": "object",
  "required": [
    "orderId"
  ],
  "properties": {
    "orderId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateGetOrderParams = createSchemaValidator<GetOrderParams>(GetOrderParamsSchema, "getOrder params");
export const validateGetOrderParamsArgs: RuntimeValidator<[GetOrderParams]> = (args) => {
  const [params] = args;
  return [validateGetOrderParams((params ?? {}) as GetOrderParams)];
};

const GetOrderResponseSchema = {
  "type": "object",
  "properties": {
    "id": {
      "type": "integer"
    },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "integer"
          },
          "productId": {
            "type": "integer"
          },
          "quantity": {
            "type": "integer"
          },
          "price": {
            "type": "number"
          }
        }
      }
    },
    "total": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "confirmed",
        "shipped",
        "delivered"
      ]
    },
    "createdAt": {
      "type": "string"
    }
  }
} as const;
export const validateGetOrderResponse = createSchemaValidator<GetOrderResponse>(GetOrderResponseSchema, "getOrder response");
