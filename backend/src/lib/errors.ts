export enum ErrorCode {
  MISSING_FIELDS = "MISSING_FIELDS",
  INVALID_PASSWORD = "INVALID_PASSWORD",
  USER_ALREADY_EXISTS = "USER_ALREADY_EXISTS",
  NOT_FOUND = "NOT_FOUND",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND",
  INSUFFICIENT_STOCK = "INSUFFICIENT_STOCK",
  CART_EMPTY = "CART_EMPTY",
  ORDER_NOT_FOUND = "ORDER_NOT_FOUND",
  ORDER_ITEM_NOT_FOUND = "ORDER_ITEM_NOT_FOUND",
}

export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.MISSING_FIELDS]: "All fields are required",
  [ErrorCode.INVALID_PASSWORD]: "Password must be at least 6 characters long",
  [ErrorCode.USER_ALREADY_EXISTS]: "User already exists",
  [ErrorCode.NOT_FOUND]: "Resource not found",
  [ErrorCode.INTERNAL_ERROR]: "Internal server error",
  [ErrorCode.AUTHENTICATION_FAILED]: "Authentication failed",
  [ErrorCode.VALIDATION_FAILED]: "Validation failed",
  [ErrorCode.INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCode.USER_NOT_FOUND]: "User not found",
  [ErrorCode.BAD_REQUEST]: "Bad request",
  [ErrorCode.PRODUCT_NOT_FOUND]: "Product not found",
  [ErrorCode.INSUFFICIENT_STOCK]: "Not enough stock available",
  [ErrorCode.CART_EMPTY]: "Cart is empty",
  [ErrorCode.ORDER_NOT_FOUND]: "Order not found",
  [ErrorCode.ORDER_ITEM_NOT_FOUND]: "Order item not found",
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, statusCode: number, message?: string) {
    super(message ?? ErrorMessages[code]);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

export type ErrorResponseBody = {
  success: false;
  code: ErrorCode;
  message: string;
};
