import { useScrewMutation, useScrewQuery } from 'reactscrew';
import type { QueryObserverOptions, UseScrewMutationOptions } from 'reactscrew';
import type {
  ListUsersParams,
  ListUsersResponse,
  CreateUserParams,
  CreateUserBody,
  CreateUserResponse,
  GetUserParams,
  GetUserResponse,
  LoginParams,
  LoginBody,
  LoginResponse,
  GetWishlistParams,
  GetWishlistResponse,
  AddToWishlistParams,
  AddToWishlistBody,
  AddToWishlistResponse,
} from '../types';

export const useListUsersQuery = (
  params: ListUsersParams,
  options?: Omit<QueryObserverOptions<[ListUsersParams], ListUsersResponse>, 'args'>
) =>
  useScrewQuery<ListUsersResponse>("users", "listUsers", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useCreateUserMutation = (
  options?: UseScrewMutationOptions<CreateUserResponse, CreateUserBody>
) => {
  const mutation = useScrewMutation<CreateUserResponse, CreateUserBody>(
    "users",
    "createUser",
    options
  );

  return {
    ...mutation,
    mutate: (body?: CreateUserBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: CreateUserBody) =>
      mutation.mutateAsync(body)
  };
};

export const useGetUserQuery = (
  params: GetUserParams,
  options?: Omit<QueryObserverOptions<[GetUserParams], GetUserResponse>, 'args'>
) =>
  useScrewQuery<GetUserResponse>("users", "getUser", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useLoginMutation = (
  options?: UseScrewMutationOptions<LoginResponse, LoginBody>
) => {
  const mutation = useScrewMutation<LoginResponse, LoginBody>(
    "auth",
    "login",
    options
  );

  return {
    ...mutation,
    mutate: (body?: LoginBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: LoginBody) =>
      mutation.mutateAsync(body)
  };
};

export const useGetWishlistQuery = (
  params?: GetWishlistParams,
  options?: Omit<QueryObserverOptions<[GetWishlistParams], GetWishlistResponse>, 'args'>
) =>
  useScrewQuery<GetWishlistResponse>("wishlist", "getWishlist", {
    ...options,
    args: params === undefined ? [] : [params]
  });

export const useAddToWishlistMutation = (
  options?: UseScrewMutationOptions<AddToWishlistResponse, AddToWishlistBody>
) => {
  const mutation = useScrewMutation<AddToWishlistResponse, AddToWishlistBody>(
    "wishlist",
    "addToWishlist",
    options
  );

  return {
    ...mutation,
    mutate: (body?: AddToWishlistBody) =>
      mutation.mutate(body),
    mutateAsync: (body?: AddToWishlistBody) =>
      mutation.mutateAsync(body)
  };
};
