import type { DocumentedErrorDefinition } from 'reactscrew';

export const generatedErrorCatalog = {
  ListProducts: [
  ],
  CreateProduct: [
  ],
  GetProduct: [
    { status: "404", code: "GETPRODUCT_404", description: "Product not found", retryable: false, uiHint: "not-found" },
  ],
  UpdateProduct: [
  ],
  ListCategories: [
  ],
} as const;

export const ListProductsErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.ListProducts as unknown as DocumentedErrorDefinition[];
export const CreateProductErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.CreateProduct as unknown as DocumentedErrorDefinition[];
export const GetProductErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.GetProduct as unknown as DocumentedErrorDefinition[];
export const UpdateProductErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.UpdateProduct as unknown as DocumentedErrorDefinition[];
export const ListCategoriesErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.ListCategories as unknown as DocumentedErrorDefinition[];
