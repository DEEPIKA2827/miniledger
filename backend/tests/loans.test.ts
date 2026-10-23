import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../src/app';
import { prisma } from '../src/lib/prisma';

describe('Loan Routes (POST/GET/PATCH /api/loans/*)', () => {
  const app = buildApp();
  const testUserId = 'user_test_456';
  const testPhone = '9876543210';
  let validToken: string;

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    validToken = app.jwt.sign({ id: testUserId, phone: testPhone });
  });

  describe('Authentication Guard', () => {
    it('should return 401 Unauthorized when Authorization header is missing', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/loans',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 401 Unauthorized when token is invalid', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/loans',
        headers: {
          authorization: 'Bearer invalid_garbage_token',
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/loans (Create Loan)', () => {
    it('should reject invalid payloads (e.g. negative amount, short name)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/loans',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        payload: {
          friendName: 'A',
          amount: -500,
          dueDate: 'invalid-date',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should create a loan entry and return 201 with correct overdue status', async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      vi.spyOn(prisma.loan, 'create').mockResolvedValue({
        id: 'loan_new_1',
        userId: testUserId,
        friendName: 'Rahul Sharma',
        amount: 1500.0 as any,
        dueDate: futureDate,
        isRepaid: false,
        repaidAt: null,
        notes: 'Dinner bill',
        receiptUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/loans',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        payload: {
          friendName: 'Rahul Sharma',
          amount: 1500.0,
          dueDate: futureDate.toISOString(),
          notes: 'Dinner bill',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.loan.id).toBe('loan_new_1');
      expect(body.loan.friendName).toBe('Rahul Sharma');
      expect(body.loan.amount).toBe(1500);
      expect(body.loan.isOverdue).toBe(false);
      expect(body.loan.isRepaid).toBe(false);
    });
  });

  describe('GET /api/loans (List Loans with Dynamic Overdue)', () => {
    it('should return loans list and dynamically compute isOverdue for overdue items', async () => {
      const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      vi.spyOn(prisma.loan, 'findMany').mockResolvedValue([
        {
          id: 'loan_past_1',
          userId: testUserId,
          friendName: 'Priya Singh',
          amount: 2000.0 as any,
          dueDate: pastDate,
          isRepaid: false,
          repaidAt: null,
          notes: null,
          receiptUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'loan_future_2',
          userId: testUserId,
          friendName: 'Amit Verma',
          amount: 500.0 as any,
          dueDate: futureDate,
          isRepaid: false,
          repaidAt: null,
          notes: null,
          receiptUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/loans',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.loans).toHaveLength(2);

      const priyaLoan = body.loans.find((l: any) => l.id === 'loan_past_1');
      expect(priyaLoan.isOverdue).toBe(true);

      const amitLoan = body.loans.find((l: any) => l.id === 'loan_future_2');
      expect(amitLoan.isOverdue).toBe(false);
    });
  });

  describe('GET /api/loans/summary (Ledger Financial Metrics)', () => {
    it('should accurately compute totalLent, totalRepaid, totalOverdue and counts', async () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const futureDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

      vi.spyOn(prisma.loan, 'findMany').mockResolvedValue([
        {
          amount: 1500.0 as any,
          isRepaid: true,
          dueDate: pastDate,
        } as any,
        {
          amount: 2000.0 as any,
          isRepaid: false,
          dueDate: pastDate, // Overdue
        } as any,
        {
          amount: 1000.0 as any,
          isRepaid: false,
          dueDate: futureDate, // Active pending
        } as any,
      ]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/loans/summary',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.summary.totalLent).toBe(4500.0);
      expect(body.summary.totalRepaid).toBe(1500.0);
      expect(body.summary.totalOverdue).toBe(2000.0);
      expect(body.summary.activeLoanCount).toBe(2);
      expect(body.summary.settledLoanCount).toBe(1);
    });
  });

  describe('PATCH /api/loans/:id/repay (Mark as Repaid)', () => {
    it('should return 404 if loan does not exist or belongs to another user', async () => {
      vi.spyOn(prisma.loan, 'findFirst').mockResolvedValue(null);

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/loans/loan_unknown/repay',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('Loan entry not found');
    });

    it('should return 400 if loan is already marked as repaid', async () => {
      vi.spyOn(prisma.loan, 'findFirst').mockResolvedValue({
        id: 'loan_already_paid',
        userId: testUserId,
        friendName: 'Priya',
        amount: 100 as any,
        dueDate: new Date(),
        isRepaid: true,
        repaidAt: new Date(),
        notes: null,
        receiptUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/loans/loan_already_paid/repay',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('already been marked as repaid');
    });

    it('should settle loan and return 200 with isRepaid true and isOverdue false', async () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const now = new Date();

      vi.spyOn(prisma.loan, 'findFirst').mockResolvedValue({
        id: 'loan_settle_me',
        userId: testUserId,
        friendName: 'Priya',
        amount: 1000 as any,
        dueDate: pastDate,
        isRepaid: false,
        repaidAt: null,
        notes: null,
        receiptUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.spyOn(prisma.loan, 'update').mockResolvedValue({
        id: 'loan_settle_me',
        userId: testUserId,
        friendName: 'Priya',
        amount: 1000 as any,
        dueDate: pastDate,
        isRepaid: true,
        repaidAt: now,
        notes: null,
        receiptUrl: null,
        createdAt: new Date(),
        updatedAt: now,
      });

      const response = await app.inject({
        method: 'PATCH',
        url: '/api/loans/loan_settle_me/repay',
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.loan.isRepaid).toBe(true);
      expect(body.loan.repaidAt).toBeDefined();
      expect(body.loan.isOverdue).toBe(false);
    });
  });
});
