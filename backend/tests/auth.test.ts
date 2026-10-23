import { describe, it, expect, vi, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Auth Routes (POST /api/auth/*)', () => {
  const app = buildApp();

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/send-otp', () => {
    it('should reject a phone number that is not exactly 10 digits', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/send-otp',
        payload: {
          phone: '12345', // Invalid
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Phone number must be exactly 10 digits');
    });

    it('should generate an OTP and return 200 for a valid 10-digit phone number', async () => {
      // Mock Prisma create
      vi.spyOn(prisma.otpVerification, 'create').mockResolvedValue({
        id: 'otp_test_id',
        phone: '9876543210',
        otpCode: '4829',
        expiresAt: new Date(Date.now() + 300000),
        verified: false,
        createdAt: new Date(),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/send-otp',
        payload: {
          phone: '9876543210',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.expiresInSeconds).toBe(300);
      expect(prisma.otpVerification.create).toHaveBeenCalledOnce();
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should reject an OTP that is not 4 digits', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-otp',
        payload: {
          phone: '9876543210',
          otp: '12', // Invalid
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('OTP must be exactly 4 digits');
    });

    it('should return 400 if OTP is invalid or expired', async () => {
      // Mock findFirst returning null (no matching unexpired code)
      vi.spyOn(prisma.otpVerification, 'findFirst').mockResolvedValue(null);

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-otp',
        payload: {
          phone: '9876543210',
          otp: '9999',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Invalid or expired OTP');
    });

    it('should verify OTP, issue JWT, and create a new user if not existing', async () => {
      // 1. Mock finding the OTP record
      vi.spyOn(prisma.otpVerification, 'findFirst').mockResolvedValue({
        id: 'otp_test_id',
        phone: '9876543210',
        otpCode: '4829',
        expiresAt: new Date(Date.now() + 300000),
        verified: false,
        createdAt: new Date(),
      });

      // 2. Mock updating OTP to verified
      vi.spyOn(prisma.otpVerification, 'update').mockResolvedValue({} as any);

      // 3. Mock user lookup (new user: returns null)
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      // 4. Mock user creation
      vi.spyOn(prisma.user, 'create').mockResolvedValue({
        id: 'user_new_123',
        phone: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/verify-otp',
        payload: {
          phone: '9876543210',
          otp: '4829',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.token).toBeDefined();
      expect(typeof body.token).toBe('string');
      expect(body.user.id).toBe('user_new_123');
      expect(body.user.phone).toBe('9876543210');

      // Verify JWT can be decoded
      const decoded = app.jwt.decode(body.token) as any;
      expect(decoded.id).toBe('user_new_123');
      expect(decoded.phone).toBe('9876543210');
    });
  });
});
