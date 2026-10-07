import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import prisma from './config/database';

const server = app.listen(env.PORT, async () => {
  try {
    // Verify database connection at startup
    await prisma.$connect();
    logger.info(`✅ Database connected successfully`);
    logger.info(`🚀 BizInvoice Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed at startup');
    process.exit(1);
  }
});

// Graceful shutdown handling
const handleGracefulShutdown = (signal: string) => {
  logger.info(`${signal} signal received: closing HTTP server and database connection`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('HTTP server closed, Prisma disconnected. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
