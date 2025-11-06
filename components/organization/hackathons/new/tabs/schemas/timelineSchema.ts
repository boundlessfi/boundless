import { z } from 'zod';

export const timelineSchema = z
  .object({
    startDate: z.date({
      message: 'Start date is required',
    }),

    endDate: z.date({
      message: 'Judging date is required',
    }),

    registrationDeadline: z.date({
      message: 'Winner announcement date is required',
    }),

    submissionDeadline: z.date({
      message: 'Submission deadline is required',
    }),

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

    if (data.endDate <= data.submissionDeadline) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Judging must be after submission deadline',
        path: ['endDate'],
      });
    }

    if (data.registrationDeadline <= data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Winner announcement must be after judging',
        path: ['registrationDeadline'],
      });
    }
  });

export type TimelineFormData = z.infer<typeof timelineSchema>;
