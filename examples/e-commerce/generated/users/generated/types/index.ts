/** User entity */
export type User = {
  id?: number;
  name?: string;
  email?: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type TokenResponse = {
  token?: string;
};

export type WishlistItem = {
  productId?: number;
  addedAt?: string;
};

export type AddWishlistInput = {
  productId: number;
};

export type ListUsersParams = {
  limit?: number;
  offset?: number;
};
export type ListUsersResponse = Array<User>;
export type ListUsersError =
  never;

export type CreateUserParams = Record<string, never>;
export type CreateUserBody = CreateUserInput;
export type CreateUserResponse = User;
export type CreateUserError =
  | {
      status: "400";
      code: "CREATEUSER_400";
      description?: "Invalid input";
      retryable?: false;
      uiHint?: "error";
      data?: unknown;
    };

export type GetUserParams = {
  userId: number;
};
export type GetUserResponse = User;
export type GetUserError =
  | {
      status: "404";
      code: "GETUSER_404";
      description?: "User not found";
      retryable?: false;
      uiHint?: "not-found";
      data?: unknown;
    };

export type LoginParams = Record<string, never>;
export type LoginBody = LoginInput;
export type LoginResponse = TokenResponse;
export type LoginError =
  | {
      status: "401";
      code: "LOGIN_401";
      description?: "Invalid credentials";
      retryable?: false;
      uiHint?: "auth";
      data?: unknown;
    };

export type GetWishlistParams = Record<string, never>;
export type GetWishlistResponse = Array<WishlistItem>;
export type GetWishlistError =
  never;

export type AddToWishlistParams = Record<string, never>;
export type AddToWishlistBody = AddWishlistInput;
export type AddToWishlistResponse = unknown;
export type AddToWishlistError =
  never;
