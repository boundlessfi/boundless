import { z } from 'zod';

export const prizeStructureSchema = z.enum([
  'OVERALL_ONLY',
  'OVERALL_AND_TRACKS',
  'TRACKS_ONLY',
]);
export type PrizeStructure = z.infer<typeof prizeStructureSchema>;

export const prizeTierKindSchema = z.enum(['OVERALL', 'TRACK']);
export type PrizeTierKind = z.infer<typeof prizeTierKindSchema>;

export const prizeTierSchema = z
  .object({
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
    rank: z.number().int().min(1),
    passMark: z.number().min(0).max(100),
    // Optional for backward compatibility — tiers without `kind` are
    // treated as OVERALL by the backend.
    kind: prizeTierKindSchema.optional(),
    // Required when kind=TRACK. References a HackathonTrack on the same
    // hackathon (organizer creates these in the Tracks tab).
    trackId: z.string().optional(),
  })
  .superRefine((tier, ctx) => {
    if (tier.kind === 'TRACK' && !tier.trackId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['trackId'],
        message: 'Pick a track for this tier',
      });
    }
    if (tier.kind !== 'TRACK' && tier.trackId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['trackId'],
        message: 'Remove the track link or set tier kind to TRACK',
      });
    }
  });

export const rewardsSchema = z
  .object({
    prizeTiers: z
      .array(prizeTierSchema)
      .min(1, 'At least one prize tier is required'),
    prizeStructure: prizeStructureSchema.optional(),
    tracksMaxPerSubmission: z.number().int().min(1).max(20).optional(),
  })
  .superRefine((data, ctx) => {
    const structure = data.prizeStructure ?? 'OVERALL_ONLY';
    const hasTrackTier = data.prizeTiers.some(t => t.kind === 'TRACK');
    const hasOverallTier = data.prizeTiers.some(
      t => !t.kind || t.kind === 'OVERALL'
    );
    if (structure === 'OVERALL_ONLY' && hasTrackTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeStructure'],
        message:
          'Switch the structure to Overall + Tracks (or Tracks only) when any tier is a track.',
      });
    }
    if (structure === 'TRACKS_ONLY' && hasOverallTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeTiers'],
        message:
          'Tracks-only mode requires every tier to be a track. Mark the overall tiers as tracks or switch structure.',
      });
    }
    if (structure === 'OVERALL_AND_TRACKS' && !hasTrackTier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['prizeTiers'],
        message:
          'Add at least one track tier — or switch back to Overall only.',
      });
    }
  });

export type PrizeTier = z.infer<typeof prizeTierSchema>;
export type RewardsFormData = z.input<typeof rewardsSchema>;
