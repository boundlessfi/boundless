import { z } from 'zod';

import {
  BountyClaimType,
  BountyEntryType,
  getModeFields,
  SUBMISSION_VISIBILITIES,
} from './modeSchema';

/**
 * Base shape of the Submission Model section. All conditional fields are
 * optional here; the per-mode required / optional / hidden rules are layered on
 * by `makeSubmissionModelSchema(mode)`, which mirrors the backend publish gate
 * (`validateTwoAxisMode`). Keeping a base object lets us derive a stable
 * FormData type while the active schema varies by mode.
 */
const submissionModelBase = z.object({
  submissionDeadline: z.string().min(1, 'Submission deadline is required'),
  submissionVisibility: z.enum(SUBMISSION_VISIBILITIES),
  reputationMinimum: z.union([z.number().int().min(0), z.null()]).optional(),
  applicationWindowCloseAt: z.union([z.string().min(1), z.null()]).optional(),
  maxApplicants: z.union([z.number().int().min(1), z.null()]).optional(),
  shortlistSize: z.union([z.number().int().min(1), z.null()]).optional(),
  applicationCreditCost: z
    .union([z.number().int().min(0).max(100), z.null()])
    .optional(),
});

export type SubmissionModelFormData = z.input<typeof submissionModelBase>;

const isSet = (v: unknown): boolean => v !== null && v !== undefined;

/**
 * Build the mode-aware schema. The required fields, and the `>= 2` floors on
 * maxApplicants (open competition) and shortlistSize (application
 * competition), match the server gate so the client blocks the same invalid
 * combinations before publish.
 */
export function makeSubmissionModelSchema(
  entryType: BountyEntryType,
  claimType: BountyClaimType,
  reputationFloor = 0
) {
  const fields = getModeFields(entryType, claimType);

  return submissionModelBase.superRefine((data, ctx) => {
    if (fields.reputationMinimum === 'required') {
      if (!isSet(data.reputationMinimum)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Reputation minimum is required for open single-claim bounties',
          path: ['reputationMinimum'],
        });
      } else if ((data.reputationMinimum as number) < reputationFloor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Minimum reputation for this category is ${reputationFloor}`,
          path: ['reputationMinimum'],
        });
      }
    }

    if (
      fields.applicationWindowCloseAt === 'required' &&
      !isSet(data.applicationWindowCloseAt)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'An application window close time is required',
        path: ['applicationWindowCloseAt'],
      });
    }

    if (fields.maxApplicants === 'required') {
      if (!isSet(data.maxApplicants) || (data.maxApplicants as number) < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'An open competition needs a max applicants of at least 2',
          path: ['maxApplicants'],
        });
      }
    }

    if (fields.shortlistSize === 'required') {
      if (!isSet(data.shortlistSize) || (data.shortlistSize as number) < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A competition needs a shortlist size of at least 2',
          path: ['shortlistSize'],
        });
      }
    }

    // Competition modes must hide submissions until the deadline.
    if (
      claimType === 'COMPETITION' &&
      data.submissionVisibility !== 'HIDDEN_UNTIL_DEADLINE'
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Competition submissions are hidden until the deadline',
        path: ['submissionVisibility'],
      });
    }
  });
}
