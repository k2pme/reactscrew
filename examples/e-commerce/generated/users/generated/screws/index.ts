import type { ScrewsMap } from 'reactscrew';
import type {
  ListUsersParams,
  CreateUserParams,
  GetUserParams,
  LoginParams,
  GetWishlistParams,
  AddToWishlistParams,
} from '../types';
import {
  validateListUsersParamsArgs,
  validateListUsersResponse,
  validateCreateUserBody,
  validateCreateUserResponse,
  validateGetUserParamsArgs,
  validateGetUserResponse,
  validateLoginBody,
  validateLoginResponse,
  validateGetWishlistResponse,
  validateAddToWishlistBody,
} from '../validators';
import {
  CreateUserErrors,
  GetUserErrors,
  LoginErrors,
} from '../errors';

export const usersScrew = {
  name: "users",
  methods: {
    listUsers: {
      type: 'query',
      route: (params: ListUsersParams) => {
    const pathname = `/users`;
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  },
      httpMethod: 'GET',
      paramsValidator: validateListUsersParamsArgs,
      responseValidator: validateListUsersResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "List all users"
    },
    createUser: {
      type: 'mutation',
      route: "/users",
      httpMethod: 'POST',
      bodyValidator: validateCreateUserBody,
      responseValidator: validateCreateUserResponse,
      documentedErrors: CreateUserErrors,
      description: "Create a new user"
    },
    getUser: {
      type: 'query',
      route: (params: GetUserParams) => `/users/\${encodeURIComponent(String(params.userId))}`,
      httpMethod: 'GET',
      paramsValidator: validateGetUserParamsArgs,
      responseValidator: validateGetUserResponse,
      documentedErrors: GetUserErrors,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "Get a user by ID"
    }
  }
};

export const authScrew = {
  name: "auth",
  methods: {
    login: {
      type: 'mutation',
      route: "/auth/login",
      httpMethod: 'POST',
      bodyValidator: validateLoginBody,
      responseValidator: validateLoginResponse,
      documentedErrors: LoginErrors,
      description: "Authenticate a user"
    }
  }
};

export const wishlistScrew = {
  name: "wishlist",
  methods: {
    getWishlist: {
      type: 'query',
      route: "/wishlist",
      httpMethod: 'GET',
      responseValidator: validateGetWishlistResponse,
      queryKey: ({ screwName, methodName, args }) => [screwName, methodName, args[0] ?? null],
      description: "Get user wishlist"
    },
    addToWishlist: {
      type: 'mutation',
      route: "/wishlist",
      httpMethod: 'POST',
      bodyValidator: validateAddToWishlistBody,
      description: "Add product to wishlist"
    }
  }
};

export const generatedScrews = {
  users: usersScrew,
  auth: authScrew,
  wishlist: wishlistScrew,
};

export const screws = generatedScrews satisfies ScrewsMap;
