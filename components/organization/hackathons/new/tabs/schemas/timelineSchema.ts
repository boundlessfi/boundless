import { z } from 'zod';

export const timelineSchema = z
  .object({
    startDate: z.date({
      message: 'Start date is required',
    }),

    submissionDeadline: z.date({
      message: 'Submission deadline is required',
    }),

    judgingStart: z.date({
      message: 'Judging start date is required',
    }),

    endDate: z.date({
      message: 'End date is required',
    }),

    judgingEnd: z.date().optional(),

    winnersAnnouncedAt: z.date().optional(),

    timezone: z.string().min(1, 'Timezone is required'),

    phases: z
      .array(
        z.object({
          name: z.string().min(1, 'Phase name is required'),
          startDate: z.date({
            message: 'Phase start date is required',
          }),
          endDate: z.date({
            message: 'Phase end date is required',
          }),
          description: z.string().optional(),
        })
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.submissionDeadline <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Submission deadline must be after start date',
        path: ['submissionDeadline'],
      });
    }

    if (data.judgingStart <= data.submissionDeadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Judging must start after submission deadline',
        path: ['judgingStart'],
      });
    }

    if (data.endDate <= data.judgingStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after judging start',
        path: ['endDate'],
      });
    }

    if (data.judgingEnd && data.judgingEnd <= data.judgingStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Judging end must be after judging start',
        path: ['judgingEnd'],
      });
    }

    if (data.judgingEnd && data.judgingEnd >= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Judging end must be before hackathon end date',
        path: ['judgingEnd'],
      });
    }

    if (data.winnersAnnouncedAt) {
      const judgingEnd = data.judgingEnd ?? data.judgingStart;
      if (data.winnersAnnouncedAt <= judgingEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Winner announcement must be after judging',
          path: ['winnersAnnouncedAt'],
        });
      }
    }
  });

export type TimelineFormData = z.infer<typeof timelineSchema>;
