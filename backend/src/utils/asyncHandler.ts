import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * asyncHandler — Eliminates repetitive try/catch in every controller.
 *
 * Without asyncHandler, every async route would need:
 *   router.get('/', async (req, res, next) => {
 *     try {
 *       const data = await someService();
 *       res.json(data);
 *     } catch (err) {
 *       next(err);  // ← manually forward to error middleware
 *     }
 *   });
 *
 * With asyncHandler:
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await someService();
 *     res.json(data);
 *   }));
 *
 * Any thrown error or rejected promise is automatically forwarded to next(err),
 * which triggers the global error middleware.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
