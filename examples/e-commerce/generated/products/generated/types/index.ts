/** Product entity */
export type Product = {
  id?: number;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  image?: string;
  rating?: {
  rate?: number;
  count?: number;
};
};

export type CreateProductInput = {
  title: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
};

export type UpdateProductInput = {
  price?: number;
  description?: string;
};

export type Category = {
  id?: number;
  name?: string;
};

export type ListProductsParams = {
  limit?: number;
  offset?: number;
  category?: string;
  search?: string;
};
export type ListProductsResponse = Array<Product>;
export type ListProductsError =
  never;

export type CreateProductParams = Record<string, never>;
export type CreateProductBody = CreateProductInput;
export type CreateProductResponse = Product;
export type CreateProductError =
  never;

export type GetProductParams = {
  productId: number;
};
export type GetProductResponse = Product;
export type GetProductError =
  | {
      status: "404";
      code: "GETPRODUCT_404";
      description?: "Product not found";
      retryable?: false;
      uiHint?: "not-found";
      data?: unknown;
    };

export type UpdateProductParams = {
  productId: number;
};
export type UpdateProductBody = UpdateProductInput;
export type UpdateProductResponse = Product;
export type UpdateProductError =
  never;

export type ListCategoriesParams = Record<string, never>;
export type ListCategoriesResponse = Array<Category>;
export type ListCategoriesError =
  never;
