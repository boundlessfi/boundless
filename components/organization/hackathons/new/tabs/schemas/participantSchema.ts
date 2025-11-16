import { z } from 'zod';

export const participantSchema = z
  .object({
    participantType: z
      .enum(['individual', 'team', 'team_or_individual'])
      .default('individual'),
    teamMin: z.number().min(1).max(20).optional(),
    teamMax: z.number().min(1).max(20).optional(),
    require_github: z.boolean().optional(),
    require_demo_video: z.boolean().optional(),
    require_other_links: z.boolean().optional(),
    detailsTab: z.boolean().optional(),
    participantsTab: z.boolean().optional(),
    resourcesTab: z.boolean().optional(),
    submissionTab: z.boolean().optional(),
    announcementsTab: z.boolean().optional(),
    discussionTab: z.boolean().optional(),
    winnersTab: z.boolean().optional(),
    sponsorsTab: z.boolean().optional(),
    joinATeamTab: z.boolean().optional(),
    rulesTab: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.participantType === 'team' ||
      data.participantType === 'team_or_individual'
    ) {
      if (!data.teamMin || data.teamMin < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Team minimum size is required',
          path: ['teamMin'],
        });
      }
      if (!data.teamMax || data.teamMax < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Team maximum size is required',
          path: ['teamMax'],
        });
      }
      if (data.teamMin && data.teamMax && data.teamMin > data.teamMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum team size cannot be greater than maximum',
          path: ['teamMin'],
        });
      }
    }
  });

export type ParticipantFormData = z.input<typeof participantSchema>;
