import { createSchemaValidator } from 'reactscrew';
import type { RuntimeValidator } from 'reactscrew';
import type {
  ListUsersParams,
  ListUsersResponse,
  CreateUserParams,
  CreateUserResponse,
  CreateUserBody,
  GetUserParams,
  GetUserResponse,
  LoginParams,
  LoginResponse,
  LoginBody,
  GetWishlistParams,
  GetWishlistResponse,
  AddToWishlistParams,
  AddToWishlistResponse,
  AddToWishlistBody,
} from '../types';

const ListUsersParamsSchema = {
  "type": "object",
  "required": [],
  "properties": {
    "limit": {
      "type": "integer"
    },
    "offset": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateListUsersParams = createSchemaValidator<ListUsersParams>(ListUsersParamsSchema, "listUsers params");
export const validateListUsersParamsArgs: RuntimeValidator<[ListUsersParams]> = (args) => {
  const [params] = args;
  return [validateListUsersParams((params ?? {}) as ListUsersParams)];
};

const ListUsersResponseSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "description": "User entity",
    "properties": {
      "id": {
        "type": "integer"
      },
      "name": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      }
    }
  }
} as const;
export const validateListUsersResponse = createSchemaValidator<ListUsersResponse>(ListUsersResponseSchema, "listUsers response");

const CreateUserBodySchema = {
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "password": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "email",
    "password"
  ]
} as const;
export const validateCreateUserBody = createSchemaValidator<CreateUserBody>(CreateUserBodySchema, "createUser body");

const CreateUserResponseSchema = {
  "type": "object",
  "description": "User entity",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  }
} as const;
export const validateCreateUserResponse = createSchemaValidator<CreateUserResponse>(CreateUserResponseSchema, "createUser response");

const GetUserParamsSchema = {
  "type": "object",
  "required": [
    "userId"
  ],
  "properties": {
    "userId": {
      "type": "integer"
    }
  },
  "additionalProperties": false
} as const;
const validateGetUserParams = createSchemaValidator<GetUserParams>(GetUserParamsSchema, "getUser params");
export const validateGetUserParamsArgs: RuntimeValidator<[GetUserParams]> = (args) => {
  const [params] = args;
  return [validateGetUserParams((params ?? {}) as GetUserParams)];
};

const GetUserResponseSchema = {
  "type": "object",
  "description": "User entity",
  "properties": {
    "id": {
      "type": "integer"
    },
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  }
} as const;
export const validateGetUserResponse = createSchemaValidator<GetUserResponse>(GetUserResponseSchema, "getUser response");

const LoginBodySchema = {
  "type": "object",
  "properties": {
    "email": {
      "type": "string"
    },
    "password": {
      "type": "string"
    }
  },
  "required": [
    "email",
    "password"
  ]
} as const;
export const validateLoginBody = createSchemaValidator<LoginBody>(LoginBodySchema, "login body");

const LoginResponseSchema = {
  "type": "object",
  "properties": {
    "token": {
      "type": "string"
    }
  }
} as const;
export const validateLoginResponse = createSchemaValidator<LoginResponse>(LoginResponseSchema, "login response");

const GetWishlistResponseSchema = {
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "productId": {
        "type": "integer"
      },
      "addedAt": {
        "type": "string"
      }
    }
  }
} as const;
export const validateGetWishlistResponse = createSchemaValidator<GetWishlistResponse>(GetWishlistResponseSchema, "getWishlist response");

const AddToWishlistBodySchema = {
  "type": "object",
  "properties": {
    "productId": {
      "type": "integer"
    }
  },
  "required": [
    "productId"
  ]
} as const;
export const validateAddToWishlistBody = createSchemaValidator<AddToWishlistBody>(AddToWishlistBodySchema, "addToWishlist body");
