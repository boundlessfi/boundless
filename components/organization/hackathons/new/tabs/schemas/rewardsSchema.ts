import { z } from 'zod';

export const prizeTierSchema = z.object({
  id: z.string(),
  place: z.string().trim().min(1, 'Place is required'),
  prizeAmount: z
    .string()
    .refine(
      v => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
      'Please enter a valid prize amount'
    ),
  description: z.string().optional(),
  currency: z.string().optional().default('USDC'),
  passMark: z.number().min(0).max(100),
});

export const rewardsSchema = z.object({
  prizeTiers: z
    .array(prizeTierSchema)
    .min(1, 'At least one prize tier is required'),
});

export type PrizeTier = z.infer<typeof prizeTierSchema>;
export type RewardsFormData = z.input<typeof rewardsSchema>;
