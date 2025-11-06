import { z } from 'zod';

export const infoSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),

    banner: z
      .string()
      .min(1, 'Banner is required')
      .url('Banner must be a valid URL'),

    description: z
      .string()
      .min(1, 'Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(5000, 'Description must be less than 5000 characters'),

    category: z
      .string()
      .min(1, 'Category is required')
      .refine(
        val =>
          [
            'DeFi',
            'NFTs',
            'DAOs',
            'Layer 2',
            'Cross-chain',
            'Web3 Gaming',
            'Social Tokens',
            'Infrastructure',
            'Privacy',
            'Sustainability',
            'Real World Assets',
            'Other',
          ].includes(val),
        'Please select a valid category'
      ),

    venueType: z.enum(['virtual', 'physical'], {
      message: 'Venue type is required',
    }),

    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    venueName: z.string().optional(),
    venueAddress: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.venueType === 'physical') {
      if (!data.country || data.country.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Country is required for physical venues',
          path: ['country'],
        });
      }
      if (!data.state || data.state.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'State/Province is required for physical venues',
          path: ['state'],
        });
      }
      if (!data.city || data.city.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'City is required for physical venues',
          path: ['city'],
        });
      }
      if (!data.venueName || data.venueName.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Venue name is required for physical venues',
          path: ['venueName'],
        });
      }
      if (!data.venueAddress || data.venueAddress.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Venue address is required for physical venues',
          path: ['venueAddress'],
        });
      }
    }
  });

export type InfoFormData = z.infer<typeof infoSchema>;
