import { z } from 'zod';

const errorResponseSchema = z.object({
  statusCode: z.number().optional(),
  error: z.string().optional(),
  message: z.string(),
});

export const loanResponseSchema = z.object({
  id: z.string(),
  friendName: z.string(),
  amount: z.number(),
  dueDate: z.string(),
  isRepaid: z.boolean(),
  repaidAt: z.string().nullable(),
  notes: z.string().nullable(),
  receiptUrl: z.string().nullable().optional(),
  isOverdue: z.boolean(),
  createdAt: z.string(),
});

export const createLoanSchema = {
  body: z.object({
    friendName: z
      .string()
      .trim()
      .min(2, 'Friend name must be at least 2 characters')
      .max(100, 'Friend name must not exceed 100 characters'),
    amount: z
      .number({ invalid_type_error: 'Amount must be a valid number' })
      .positive('Amount must be greater than 0'),
    dueDate: z
      .string()
      .trim()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: 'Due date must be a valid date string (e.g. YYYY-MM-DD or ISO 8601)',
      }),
    notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  }),
  response: {
    201: z.object({
      success: z.boolean(),
      loan: loanResponseSchema,
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
  },
};

export const getLoansSchema = {
  response: {
    200: z.object({
      success: z.boolean(),
      loans: z.array(loanResponseSchema),
    }),
    401: errorResponseSchema,
  },
};

export const repayLoanSchema = {
  params: z.object({
    id: z.string().trim().min(1, 'Loan ID is required'),
  }),
  response: {
    200: z.object({
      success: z.boolean(),
      loan: loanResponseSchema,
    }),
    400: errorResponseSchema,
    404: errorResponseSchema,
    401: errorResponseSchema,
  },
};

export const summaryResponseSchema = z.object({
  totalLent: z.number(),
  totalRepaid: z.number(),
  totalOverdue: z.number(),
  activeLoanCount: z.number(),
  settledLoanCount: z.number(),
});

export const getSummarySchema = {
  response: {
    200: z.object({
      success: z.boolean(),
      summary: summaryResponseSchema,
    }),
    401: errorResponseSchema,
  },
};

export type CreateLoanInput = z.infer<typeof createLoanSchema.body>;
export type RepayLoanParams = z.infer<typeof repayLoanSchema.params>;
export type LedgerSummary = z.infer<typeof summaryResponseSchema>;
