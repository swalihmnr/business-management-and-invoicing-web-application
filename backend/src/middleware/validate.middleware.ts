import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validation Middleware Factory
 *
 * Takes a Zod schema and returns an Express middleware that validates
 * the request body against it. If validation fails, returns a structured
 * 400 response with field-level error messages.
 *
 * Usage in routes:
 *   router.post('/', validate(createCustomerSchema), customerController.create);
 *
 * Why Zod?
 * Zod schemas are TypeScript-first. The same schema both validates and
 * infers the TypeScript type — no duplication between validation and types.
 */
export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return next(ApiError.badRequest('Validation failed', errors));
    }

    // Replace raw input with the parsed (and potentially transformed) data
    req[source] = result.data;
    next();
  };

function formatZodErrors(error: ZodError): { field: string; message: string }[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}
