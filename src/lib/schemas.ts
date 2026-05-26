import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export const generateInvoiceSchema = z.object({
  companyNit: z.string().regex(/^\d{9,10}$/, 'El NIT debe tener 9 o 10 dígitos'),
  concept: z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
  amount: z.number().positive('El valor debe ser mayor a 0'),
});

const accountTypeSchema = z.enum(['ahorros', 'corriente']);

export const createCobradorSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio').max(150),
  email: z.string().email('Correo inválido'),
  identification_number: z
    .string()
    .regex(/^\d{6,12}$/, 'La identificación debe tener entre 6 y 12 dígitos')
    .optional()
    .or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  bank_name: z.string().max(100).optional().or(z.literal('')),
  bank_account: z.string().max(30).optional().or(z.literal('')),
  account_type: accountTypeSchema.optional(),
});

export const updateCobradorSchema = z.object({
  name: z.string().min(3).max(150).optional(),
  identification_number: z
    .string()
    .regex(/^\d{6,12}$/)
    .nullable()
    .optional()
    .or(z.literal('')),
  address: z.string().max(300).nullable().optional().or(z.literal('')),
  bank_name: z.string().max(100).nullable().optional().or(z.literal('')),
  bank_account: z.string().max(30).nullable().optional().or(z.literal('')),
  account_type: accountTypeSchema.nullable().optional(),
  is_active: z.boolean().optional(),
});

export type LoginRequest = z.infer<typeof loginSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type GenerateInvoiceRequest = z.infer<typeof generateInvoiceSchema>;
export type CreateCobradorRequest = z.infer<typeof createCobradorSchema>;
export type UpdateCobradorRequest = z.infer<typeof updateCobradorSchema>;
