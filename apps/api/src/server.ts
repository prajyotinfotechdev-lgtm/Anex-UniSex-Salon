import app from './app';
import { env } from './config/env.config';
import { logger } from './config/logger.config';
import { prisma } from './database/prisma.client';

const PORT = parseInt(env.PORT, 10);

const server = app.listen(PORT, () => {
  logger.info(`🚀 API running on http://localhost:${PORT}`);
  logger.info(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Database connections closed.');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error during database disconnection');
      process.exit(1);
    }
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught Exception');
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal(reason, 'Unhandled Rejection');
  gracefulShutdown('unhandledRejection');
});