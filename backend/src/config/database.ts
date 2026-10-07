import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma Client Singleton Pattern
 *
 * Why singleton?
 * Prisma opens a connection pool to PostgreSQL. If we create a new PrismaClient
 * on every request, we'd exhaust DB connections quickly. One shared instance
 * reuses the connection pool for the entire application lifetime.
 *
 * The global.__prisma trick prevents hot-reload from creating multiple instances
 * during development (tsx watch re-runs the module, but global persists).
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

if (env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
