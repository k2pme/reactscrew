import { createSchemaValidator } from 'reactscrew';
import type { RuntimeValidator } from 'reactscrew';
import type {
  ListProductsParams,
  ListProductsResponse,
  CreateProductParams,
  CreateProductResponse,
  CreateProductBody,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductResponse,
  UpdateProductBody,
  ListCategoriesParams,
  ListCategoriesResponse,
} from '../types';

const ListProductsParamsSchema = {
  "type": "object",
  "required": [],
  "properties": {
    "limit": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    },
    "category": {
      "type": "string"
    },
    "search": {
      "type": "string"
    }
  },
  "additionalProperties": false
} as const;
const validateListProductsParams = createSchemaValidator<ListProductsParams>(ListProductsParamsSchema, "listProducts params");
export const validateListProductsParamsArgs: RuntimeValidator<[ListProductsParams]> = (args) => {
  const [params] = args;
  return [validateListProductsParams((params ?? {}) as ListProductsParams)];
};

const ListProductsResponseSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "description": "Product entity",
    "properties": {
      "id": {
        "type": "integer"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "price": {
        "type": "number"
      },
      "category": {
        "type": "string"
      },
      "image": {
        "type": "string"
      },
      "rating": {
        "type": "object",
        "properties": {
          "rate": {
            "type": "number"
          },
          "count": {
            "type": "integer"
          }
        }
      }
    }
  }
} as const;
export const validateListProductsResponse = createSchemaValidator<ListProductsResponse>(ListProductsResponseSchema, "listProducts response");

const CreateProductBodySchema = {
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "category": {
      "type": "string"
    },
    "image": {
      "type": "string"
    }
  },
  "required": [
    "title",
    "price",
    "category"
  ]
} as const;
export const validateCreateProductBody = createSchemaValidator<CreateProductBody>(CreateProductBodySchema, "createProduct body");

const CreateProductResponseSchema = {
  "type": "object",
  "description": "Product entity",
  "properties": {
    "id": {
      "type": "integer"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "category": {
      "type": "string"
    },
    "image": {
      "type": "string"
    },
    "rating": {
      "type": "object",
      "properties": {
        "rate": {
          "type": "number"
        },
        "count": {
          "type": "integer"
        }
      }
    }
  }
} as const;
export const validateCreateProductResponse = createSchemaValidator<CreateProductResponse>(CreateProductResponseSchema, "createProduct response");

const GetProductParamsSchema = {
  "type": "object",
  "required": [
    "productId"
  ],
  "properties": {
    "productId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateGetProductParams = createSchemaValidator<GetProductParams>(GetProductParamsSchema, "getProduct params");
export const validateGetProductParamsArgs: RuntimeValidator<[GetProductParams]> = (args) => {
  const [params] = args;
  return [validateGetProductParams((params ?? {}) as GetProductParams)];
};

const GetProductResponseSchema = {
  "type": "object",
  "description": "Product entity",
  "properties": {
    "id": {
      "type": "integer"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "category": {
      "type": "string"
    },
    "image": {
      "type": "string"
    },
    "rating": {
      "type": "object",
      "properties": {
        "rate": {
          "type": "number"
        },
        "count": {
          "type": "integer"
        }
      }
    }
  }
} as const;
export const validateGetProductResponse = createSchemaValidator<GetProductResponse>(GetProductResponseSchema, "getProduct response");

const UpdateProductParamsSchema = {
  "type": "object",
  "required": [
    "productId"
  ],
  "properties": {
    "productId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateUpdateProductParams = createSchemaValidator<UpdateProductParams>(UpdateProductParamsSchema, "updateProduct params");
export const validateUpdateProductParamsArgs: RuntimeValidator<[UpdateProductParams]> = (args) => {
  const [params] = args;
  return [validateUpdateProductParams((params ?? {}) as UpdateProductParams)];
};

const UpdateProductBodySchema = {
  "type": "object",
  "properties": {
    "price": {
      "type": "number"
    },
    "description": {
      "type": "string"
    }
  }
} as const;
export const validateUpdateProductBody = createSchemaValidator<UpdateProductBody>(UpdateProductBodySchema, "updateProduct body");

const UpdateProductResponseSchema = {
  "type": "object",
  "description": "Product entity",
  "properties": {
    "id": {
      "type": "integer"
    },
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "price": {
      "type": "number"
    },
    "category": {
      "type": "string"
    },
    "image": {
      "type": "string"
    },
    "rating": {
      "type": "object",
      "properties": {
        "rate": {
          "type": "number"
        },
        "count": {
          "type": "integer"
        }
      }
    }
  }
} as const;
export const validateUpdateProductResponse = createSchemaValidator<UpdateProductResponse>(UpdateProductResponseSchema, "updateProduct response");

const ListCategoriesResponseSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer"
      },
      "name": {
        "type": "string"
      }
    }
  }
} as const;
export const validateListCategoriesResponse = createSchemaValidator<ListCategoriesResponse>(ListCategoriesResponseSchema, "listCategories response");
