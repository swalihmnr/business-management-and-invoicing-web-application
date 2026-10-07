import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import prisma from '../config/database';

/**
 * Auth Middleware — JWT Verification
 *
 * How it works:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify token signature with JWT_SECRET
 * 3. Look up user in database (ensures user still exists and is active)
 * 4. Attach user to req.user for downstream use
 * 5. If anything fails → 401 Unauthorized
 *
 * Why look up the user on every request?
 * JWT tokens are stateless — once issued, they're valid until expiry.
 * If a user is deactivated, without a DB lookup they could still use their
 * old token for up to 7 days. The DB check prevents this.
 * Trade-off: slight latency per request (acceptable for MVP).
 */

export interface JwtPayload {
  userId: string;
  businessId?: string;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        business: {
          select: { id: true },
        },
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Account not found or deactivated');
    }

    // Attach to request for use in controllers/services
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      businessId: user.business?.id,
    };

    next();
  } catch (err) {
    next(err);
  }
};
