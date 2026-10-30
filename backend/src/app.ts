import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import dotenv from 'dotenv';

import { authRoutes } from './modules/auth/auth.routes';
import { loansRoutes } from './modules/loans/loans.routes';

dotenv.config();

/**
 * Factory function that instantiates and configures the Fastify application.
 * Kept separate from server.ts so Vitest integration tests can call buildApp()
 * and execute in-memory HTTP requests via app.inject() without binding a network port.
 */
export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  }).withTypeProvider<ZodTypeProvider>();

  // Attach Zod type provider compilers to Fastify
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Enable CORS for mobile client requests
  app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Register JWT authentication plugin with environment secret
  app.register(jwt, {
    secret: process.env.JWT_SECRET || 'miniledger_super_secret_jwt_key_for_development_2026',
  });

  // Root endpoint for friendly landing / verification
  app.get('/', async () => {
    return {
      name: 'MiniLedger Backend API',
      status: 'active',
      endpoints: {
        health: '/health',
        auth: {
          sendOtp: 'POST /api/auth/send-otp',
          verifyOtp: 'POST /api/auth/verify-otp',
        },
        loans: {
          list: 'GET /api/loans',
          create: 'POST /api/loans',
          summary: 'GET /api/loans/summary',
          repay: 'PATCH /api/loans/:id/repay',
        },
      },
    };
  });

  // Health check endpoint for monitoring and test verification
  app.get('/health', async () => {
    return {
      status: 'ok',
      service: 'miniledger-api',
      timestamp: new Date().toISOString(),
    };
  });

  // Register Module Routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(loansRoutes, { prefix: '/api/loans' });

  return app;
}
