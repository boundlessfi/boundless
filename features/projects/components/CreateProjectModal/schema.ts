import { z } from 'zod';

export const milestoneSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(val.startDate);
    const endDate = new Date(val.endDate);

    // Check if start date is in the future (at least tomorrow)
    if (startDate <= today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'Start date must be at least tomorrow',
      });
    }

    // Check if end date is after start date
    if (endDate <= startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'End date must be after start date',
      });
    }

    // Check if milestone has reasonable duration (at least 1 week)
    const durationInDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (durationInDays < 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endDate'],
        message: 'Milestone duration must be at least 1 week',
      });
    }

    // Check if milestone is not too far in the future (max 2 years)
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
    if (startDate > maxFutureDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['startDate'],
        message: 'Start date cannot be more than 2 years in the future',
      });
    }
  });

export const projectSchema = z.object({
  basic: z.object({
    projectName: z.string().trim().min(1),
    logo: z.any().optional(),
    logoUrl: z.string().optional(),
    banner: z.any().optional(),
    bannerUrl: z.string().optional(),
    vision: z.string().trim().min(1).max(300),
    category: z.string().trim().min(1),
    githubUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        v => !v || /^https?:\/\/.+/i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v),
        {
          message:
            'Please enter a valid URL (with or without https), e.g., https://github.com or github.com',
        }
      )
      .optional(),
    websiteUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        v => !v || /^https?:\/\/.+/i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v),
        {
          message:
            'Please enter a valid URL (with or without https), e.g., https://boundlessfi.xyz or boundlessfi.xyz',
        }
      )
      .optional(),
    demoVideoUrl: z
      .string()
      .trim()
      .optional()
      .or(z.literal(''))
      .refine(
        v => !v || /^https?:\/\/.+/i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v),
        {
          message:
            'Please enter a valid URL (with or without https), e.g., https://demo.com or demo.com',
        }
      )
      .optional(),
    socialLinks: z.array(z.string()).min(1),
  }),
  details: z.object({
    vision: z.string().trim().min(1),
  }),
  milestones: z.object({
    fundingAmount: z
      .string()
      .refine(v => !isNaN(parseFloat(v)) && parseFloat(v) > 0),
    milestones: z
      .array(milestoneSchema)
      .min(1)
      .superRefine((milestones, ctx) => {
        // Check that milestones are in chronological order
        for (let i = 0; i < milestones.length - 1; i++) {
          const currentEndDate = new Date(milestones[i].endDate);
          const nextStartDate = new Date(milestones[i + 1].startDate);

          // Allow some overlap (up to 1 day) but not significant overlap
          const daysBetween = Math.ceil(
            (nextStartDate.getTime() - currentEndDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (daysBetween < -1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i + 1, 'startDate'],
              message: `Milestone ${i + 2} start date should be after milestone ${i + 1} end date`,
            });
          }
        }

        // Check that total project timeline is reasonable (max 3 years)
        if (milestones.length > 0) {
          const firstStartDate = new Date(milestones[0].startDate);
          const lastEndDate = new Date(
            milestones[milestones.length - 1].endDate
          );
          const totalDurationInDays = Math.ceil(
            (lastEndDate.getTime() - firstStartDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          if (totalDurationInDays > 1095) {
            // 3 years
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['milestones'],
              message: 'Total project timeline cannot exceed 3 years',
            });
          }
        }
      }),
  }),
  team: z
    .object({
      members: z
        .array(
          z.object({
            id: z.string(),
            email: z.string().email(),
            role: z.string().optional(),
          })
        )
        .optional()
        .default([]),
    })
    .optional()
    .default({ members: [] }),
  contact: z.object({
    telegram: z.string().trim().min(1),
    backupType: z.enum(['discord', 'whatsapp']),
    backupContact: z.string().trim().min(1),
    agreeToTerms: z.literal(true),
    agreeToPrivacy: z.literal(true),
  }),
});
