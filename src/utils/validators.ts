import { z } from 'zod';

export const emailSchema = z.string().email('Enter a valid email address');

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const otpSchema = z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit OTP');

export const panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Enter a valid PAN number');

export const gstSchema = z
  .string()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid GST number');

export const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode');

export const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const optionalString = z.string().trim().optional();

export const positiveNumber = z.number().positive('Must be a positive number');

export const nonEmptyArray = <T extends z.ZodType>(schema: T) =>
  z.array(schema).min(1, 'At least one item is required');
