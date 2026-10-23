import { PrismaClient } from '@prisma/client';

// Singleton instance of PrismaClient to prevent connection pool exhaustion
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
