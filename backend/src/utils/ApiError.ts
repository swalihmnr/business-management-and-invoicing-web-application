/**
 * ApiError — Custom error class for business/application errors.
 *
 * Why a custom error class?
 * Node's built-in Error doesn't carry HTTP status codes or structured details.
 * By creating a custom class, we can throw a single, consistent error anywhere
 * in the service/repository layer and the global error middleware will
 * automatically know how to format the HTTP response.
 *
 * Usage:
 *   throw new ApiError(404, 'Customer not found');
 *   throw new ApiError(400, 'Validation failed', validationErrors);
 *   throw new ApiError(409, 'Invoice number already exists');
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: unknown[] = [],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly (required for instanceof to work with custom errors in TS)
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // ---- Common factory methods for readability ----
  static badRequest(message: string, errors?: unknown[]): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(resource: string): ApiError {
    return new ApiError(404, `${resource} not found`);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(500, message, [], false);
  }
}
