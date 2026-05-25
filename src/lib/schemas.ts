import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const generateInvoiceSchema = z.object({
  companyNit: z.string().regex(/^\d{9,10}$/, 'El NIT debe tener 9 o 10 dígitos'),
  concept: z.string().min(10).max(500),
  amount: z.number().positive(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type GenerateInvoiceRequest = z.infer<typeof generateInvoiceSchema>;
