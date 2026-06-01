import { useScrewMutation, useScrewQuery } from 'reactscrew';
import type { QueryObserverOptions, UseScrewMutationOptions } from 'reactscrew';
import type {
  ListProductsParams,
  ListProductsResponse,
  CreateProductParams,
  CreateProductBody,
  CreateProductResponse,
  GetProductParams,
  GetProductResponse,
  UpdateProductParams,
  UpdateProductBody,
  UpdateProductResponse,
  ListCategoriesParams,
  ListCategoriesResponse,
} from '../types';

export const useListProductsQuery = (
  params: ListProductsParams,
  options?: Omit<QueryObserverOptions<[ListProductsParams], ListProductsResponse>, 'args'>
) =>
  useScrewQuery<ListProductsResponse>("products", "listProducts", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useCreateProductMutation = (
  options?: UseScrewMutationOptions<CreateProductResponse, CreateProductBody>
) => {
  const mutation = useScrewMutation<CreateProductResponse, CreateProductBody>(
    "products",
    "createProduct",
    options
  );

  return {
    ...mutation,
    mutate: (body?: CreateProductBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: CreateProductBody) =>
      mutation.mutateAsync(body)
  };
};

export const useGetProductQuery = (
  params: GetProductParams,
  options?: Omit<QueryObserverOptions<[GetProductParams], GetProductResponse>, 'args'>
) =>
  useScrewQuery<GetProductResponse>("products", "getProduct", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useUpdateProductMutation = (
  options?: UseScrewMutationOptions<UpdateProductResponse, UpdateProductBody>
) => {
  const mutation = useScrewMutation<UpdateProductResponse, UpdateProductBody>(
    "products",
    "updateProduct",
    options
  );

  return {
    ...mutation,
    mutate: (body: UpdateProductBody, params?: UpdateProductParams) =>
      mutation.mutate(body, params),
    mutateAsync: (body: UpdateProductBody, params?: UpdateProductParams) =>
      mutation.mutateAsync(body, params)
  };
};

export const useListCategoriesQuery = (
  params?: ListCategoriesParams,
  options?: Omit<QueryObserverOptions<[ListCategoriesParams], ListCategoriesResponse>, 'args'>
) =>
  useScrewQuery<ListCategoriesResponse>("categories", "listCategories", {
    ...options,
    args: params === undefined ? [] : [params]
  });
