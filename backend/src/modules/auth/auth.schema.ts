import { z } from 'zod';

export const sendOtpSchema = {
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  }),
  response: {
    200: z.object({
      success: z.boolean(),
      message: z.string(),
      expiresInSeconds: z.number(),
    }),
    400: z.object({
      statusCode: z.number().optional(),
      error: z.string().optional(),
      message: z.string(),
    }),
  },
};

export const verifyOtpSchema = {
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    otp: z
      .string()
      .trim()
      .regex(/^[0-9]{4}$/, 'OTP must be exactly 4 digits'),
  }),
  response: {
    200: z.object({
      success: z.boolean(),
      token: z.string(),
      user: z.object({
        id: z.string(),
        phone: z.string(),
      }),
    }),
    400: z.object({
      statusCode: z.number().optional(),
      error: z.string().optional(),
      message: z.string(),
    }),
  },
};

export type SendOtpInput = z.infer<typeof sendOtpSchema.body>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema.body>;
