import { z } from 'zod';

export const timelineSchema = z
  .object({
    startDate: z.date({
      message: 'Start date is required',
    }),

    submissionDeadline: z.date({
      message: 'Submission deadline is required',
    }),

    timezone: z.string().min(1, 'Timezone is required'),

    registrationDeadline: z.date().optional(),

    judgingDeadline: z.date().optional(),

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

    if (
      data.registrationDeadline &&
      data.registrationDeadline > data.submissionDeadline
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Pre-registration end time must be on or before the submission deadline',
        path: ['registrationDeadline'],
      });
    }

    if (
      data.judgingDeadline &&
      data.judgingDeadline < data.submissionDeadline
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Judging deadline must be on or after the submission deadline',
        path: ['judgingDeadline'],
      });
    }
  });

export type TimelineFormData = z.infer<typeof timelineSchema>;
