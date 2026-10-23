import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../../lib/prisma';
import { sendOtpSchema, verifyOtpSchema } from './auth.schema';

/**
 * Authentication routes for MiniLedger:
 * 1. POST /api/auth/send-otp   -> Generates mock OTP and logs to console
 * 2. POST /api/auth/verify-otp -> Verifies OTP, signs JWT token, creates user if new
 */
export async function authRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // 1. Send Mock OTP
  typedApp.post(
    '/send-otp',
    {
      schema: sendOtpSchema,
    },
    async (request, reply) => {
      const { phone } = request.body;

      // Generate a 4-digit numeric OTP (1000 - 9999)
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Expiry: 5 minutes from now (300 seconds)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Record in database
      await prisma.otpVerification.create({
        data: {
          phone,
          otpCode,
          expiresAt,
        },
      });

      // Assignment Requirement: Print mock OTP to server console
      console.log(`\n========================================`);
      console.log(`📩 [MOCK SMS GATEWAY]`);
      console.log(`Phone: +91${phone}`);
      console.log(`Your MiniLedger OTP is: ${otpCode}`);
      console.log(`Valid for: 5 minutes`);
      console.log(`========================================\n`);

      return reply.status(200).send({
        success: true,
        message: 'OTP generated and logged to server console',
        expiresInSeconds: 300,
      });
    }
  );

  // 2. Verify OTP and Issue Token
  typedApp.post(
    '/verify-otp',
    {
      schema: verifyOtpSchema,
    },
    async (request, reply) => {
      const { phone, otp } = request.body;

      // Look up unexpired, unverified OTP record
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          phone,
          otpCode: otp,
          verified: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otpRecord) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid or expired OTP. Please request a new code.',
        });
      }

      // Single-use guarantee: Mark OTP as verified to prevent replay attacks
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { verified: true },
      });

      // Upsert: Find existing user or create a new user profile
      let user = await prisma.user.findUnique({
        where: { phone },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { phone },
        });
      }

      // Sign JWT token containing user identity
      const token = app.jwt.sign({
        id: user.id,
        phone: user.phone,
      });

      return reply.status(200).send({
        success: true,
        token,
        user: {
          id: user.id,
          phone: user.phone,
        },
      });
    }
  );
}
