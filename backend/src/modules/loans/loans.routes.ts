import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../middlewares/authenticate';
import {
  createLoanSchema,
  getLoansSchema,
  repayLoanSchema,
  getSummarySchema,
} from './loans.schema';

/**
 * Transforms a Prisma Loan database record into the standardized API response format.
 * - Converts Prisma.Decimal to standard JavaScript number for JSON serialization.
 * - Computes dynamic `isOverdue` boolean: true iff loan is unpaid and dueDate < now().
 */
export function formatLoanResponse(loan: {
  id: string;
  friendName: string;
  amount: any;
  dueDate: Date;
  isRepaid: boolean;
  repaidAt: Date | null;
  notes: string | null;
  receiptUrl?: string | null;
  createdAt: Date;
}) {
  const isOverdue = !loan.isRepaid && new Date(loan.dueDate).getTime() < Date.now();

  return {
    id: loan.id,
    friendName: loan.friendName,
    amount: Number(loan.amount),
    dueDate: new Date(loan.dueDate).toISOString(),
    isRepaid: loan.isRepaid,
    repaidAt: loan.repaidAt ? new Date(loan.repaidAt).toISOString() : null,
    notes: loan.notes,
    receiptUrl: loan.receiptUrl ?? null,
    isOverdue,
    createdAt: new Date(loan.createdAt).toISOString(),
  };
}

/**
 * Loan routes plugin with JWT authentication hook attached.
 * 1. POST /api/loans            -> Create a new loan entry
 * 2. GET /api/loans             -> List authenticated user's loans (with dynamic isOverdue)
 * 3. GET /api/loans/summary     -> Summary metrics (total lent, repaid, overdue, counts)
 * 4. PATCH /api/loans/:id/repay -> Mark a loan as settled/repaid
 */
export async function loansRoutes(app: FastifyInstance) {
  // Enforce JWT authentication on all loan endpoints
  app.addHook('preHandler', authenticate);

  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // 1. Create a new loan entry
  typedApp.post(
    '/',
    {
      schema: createLoanSchema,
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { friendName, amount, dueDate, notes } = request.body;

      const newLoan = await prisma.loan.create({
        data: {
          userId,
          friendName,
          amount,
          dueDate: new Date(dueDate),
          notes: notes || null,
        },
      });

      return reply.status(201).send({
        success: true,
        loan: formatLoanResponse(newLoan),
      });
    }
  );

  // 2. Get all loans for authenticated user
  typedApp.get(
    '/',
    {
      schema: getLoansSchema,
    },
    async (request, reply) => {
      const userId = request.user.id;

      const loans = await prisma.loan.findMany({
        where: { userId },
        orderBy: { dueDate: 'asc' },
      });

      return reply.status(200).send({
        success: true,
        loans: loans.map(formatLoanResponse),
      });
    }
  );

  // 3. Get Ledger Summary Metrics for Dashboard Card
  typedApp.get(
    '/summary',
    {
      schema: getSummarySchema,
    },
    async (request, reply) => {
      const userId = request.user.id;

      const loans = await prisma.loan.findMany({
        where: { userId },
        select: {
          amount: true,
          isRepaid: true,
          dueDate: true,
        },
      });

      let totalLent = 0;
      let totalRepaid = 0;
      let totalOverdue = 0;
      let activeLoanCount = 0;
      let settledLoanCount = 0;
      const nowTime = Date.now();

      for (const loan of loans) {
        const amt = Number(loan.amount);
        totalLent += amt;

        if (loan.isRepaid) {
          totalRepaid += amt;
          settledLoanCount++;
        } else {
          activeLoanCount++;
          if (new Date(loan.dueDate).getTime() < nowTime) {
            totalOverdue += amt;
          }
        }
      }

      return reply.status(200).send({
        success: true,
        summary: {
          totalLent: Number(totalLent.toFixed(2)),
          totalRepaid: Number(totalRepaid.toFixed(2)),
          totalOverdue: Number(totalOverdue.toFixed(2)),
          activeLoanCount,
          settledLoanCount,
        },
      });
    }
  );

  // 4. Mark a loan as repaid
  typedApp.patch(
    '/:id/repay',
    {
      schema: repayLoanSchema,
    },
    async (request, reply) => {
      const userId = request.user.id;
      const { id } = request.params;

      const existingLoan = await prisma.loan.findFirst({
        where: { id, userId },
      });

      if (!existingLoan) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Loan entry not found or belongs to another user',
        });
      }

      if (existingLoan.isRepaid) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'This loan has already been marked as repaid',
        });
      }

      const updatedLoan = await prisma.loan.update({
        where: { id },
        data: {
          isRepaid: true,
          repaidAt: new Date(),
        },
      });

      return reply.status(200).send({
        success: true,
        loan: formatLoanResponse(updatedLoan),
      });
    }
  );
}
