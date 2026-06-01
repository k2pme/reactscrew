import type { ScrewsMap } from 'reactscrew';
import type {
  ListProductsParams,
  CreateProductParams,
  GetProductParams,
  UpdateProductParams,
  ListCategoriesParams,
} from '../types';
import {
  validateListProductsParamsArgs,
  validateListProductsResponse,
  validateCreateProductBody,
  validateCreateProductResponse,
  validateGetProductParamsArgs,
  validateGetProductResponse,
  validateUpdateProductParamsArgs,
  validateUpdateProductBody,
  validateUpdateProductResponse,
  validateListCategoriesResponse,
} from '../validators';
import {
  GetProductErrors,
} from '../errors';

export const productsScrew = {
  name: "products",
  methods: {
    listProducts: {
      type: 'query',
      route: (params: ListProductsParams) => {
    const pathname = `/products`;
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    if (params.category !== undefined) searchParams.set("category", String(params.category));
    if (params.search !== undefined) searchParams.set("search", String(params.search));
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  },
      httpMethod: 'GET',
      paramsValidator: validateListProductsParamsArgs,
      responseValidator: validateListProductsResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "List all products"
    },
    createProduct: {
      type: 'mutation',
      route: "/products",
      httpMethod: 'POST',
      bodyValidator: validateCreateProductBody,
      responseValidator: validateCreateProductResponse,
      description: "Create a product"
    },
    getProduct: {
      type: 'query',
      route: (params: GetProductParams) => `/products/\${encodeURIComponent(String(params.productId))}`,
      httpMethod: 'GET',
      paramsValidator: validateGetProductParamsArgs,
      responseValidator: validateGetProductResponse,
      documentedErrors: GetProductErrors,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "Get a product by ID"
    },
    updateProduct: {
      type: 'mutation',
      route: (params: UpdateProductParams) => `/products/\${encodeURIComponent(String(params.productId))}`,
      httpMethod: 'PATCH',
      paramsValidator: validateUpdateProductParamsArgs,
      bodyValidator: validateUpdateProductBody,
      responseValidator: validateUpdateProductResponse,
      description: "Update product stock/price"
    }
  }
};

export const categoriesScrew = {
  name: "categories",
  methods: {
    listCategories: {
      type: 'query',
      route: "/categories",
      httpMethod: 'GET',
      responseValidator: validateListCategoriesResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "List all categories"
    }
  }
};

export const generatedScrews = {
  products: productsScrew,
  categories: categoriesScrew,
};

export const screws = generatedScrews satisfies ScrewsMap;
