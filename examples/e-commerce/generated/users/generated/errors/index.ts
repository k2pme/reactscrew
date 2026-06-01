import type { DocumentedErrorDefinition } from 'reactscrew';

export const generatedErrorCatalog = {
  ListUsers: [
  ],
  CreateUser: [
    { status: "400", code: "CREATEUSER_400", description: "Invalid input", retryable: false, uiHint: "error" },
  ],
  GetUser: [
    { status: "404", code: "GETUSER_404", description: "User not found", retryable: false, uiHint: "not-found" },
  ],
  Login: [
    { status: "401", code: "LOGIN_401", description: "Invalid credentials", retryable: false, uiHint: "auth" },
  ],
  GetWishlist: [
  ],
  AddToWishlist: [
  ],
} as const;

export const ListUsersErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.ListUsers as unknown as DocumentedErrorDefinition[];
export const CreateUserErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.CreateUser as unknown as DocumentedErrorDefinition[];
export const GetUserErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.GetUser as unknown as DocumentedErrorDefinition[];
export const LoginErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.Login as unknown as DocumentedErrorDefinition[];
export const GetWishlistErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.GetWishlist as unknown as DocumentedErrorDefinition[];
export const AddToWishlistErrors: DocumentedErrorDefinition[] = generatedErrorCatalog.AddToWishlist as unknown as DocumentedErrorDefinition[];
