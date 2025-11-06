import { z } from 'zod';

export const sponsorPartnerSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Sponsor/Partner name is required'),
  logo: z
    .string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: 'Logo must be a valid URL',
    }),
  link: z
    .string()
    .optional()
    .refine(val => !val || z.string().url().safeParse(val).success, {
      message: 'Link must be a valid URL',
    }),
});

export const collaborationSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .min(1, 'Contact email is required')
    .email('Please enter a valid email address'),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  socialLinks: z
    .array(
      z
        .string()
        .refine(
          val => !val || z.string().url().safeParse(val).success,
          'Social link must be a valid URL'
        )
    )
    .default([]),
  sponsorsPartners: z
    .array(sponsorPartnerSchema)
    .min(1, 'At least one sponsor or partner is required'),
});

export type SponsorPartner = z.infer<typeof sponsorPartnerSchema>;
export type CollaborationFormData = z.input<typeof collaborationSchema>;
