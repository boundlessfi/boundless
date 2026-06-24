import { z } from 'zod';

/**
 * Bounty disciplines (organizer-facing; off-chain). Mirrors the backend
 * BountyCategory enum. `development` additionally requires a GitHub issue URL.
 */
export const BOUNTY_CATEGORIES = [
  'DESIGN',
  'DEVELOPMENT',
  'CONTENT',
  'GROWTH',
  'COMMUNITY',
] as const;
export type BountyCategory = (typeof BOUNTY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<BountyCategory, string> = {
  DESIGN: 'Design',
  DEVELOPMENT: 'Development',
  CONTENT: 'Content',
  GROWTH: 'Growth',
  COMMUNITY: 'Community',
};

/**
 * Baseline minimum reputation a claimant needs, per category. The organizer can
 * raise this in the Submission step but not drop below it. Development is the
 * highest bar (it carries the most risk of low-quality / AI-generated work).
 */
export const CATEGORY_REPUTATION_BASELINE: Record<BountyCategory, number> = {
  DEVELOPMENT: 50,
  DESIGN: 25,
  GROWTH: 20,
  CONTENT: 15,
  COMMUNITY: 10,
};

/**
 * Scope step: the bounty's identity. Mirrors the backend BountyScopeSection
 * (title / description / category / country / optional GitHub issue + project).
 * The reward currency lives in the Reward step. GitHub issue URL is required
 * only for development bounties.
 */
export const scopeSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, 'Title is required')
      .max(200, 'Title must be 200 characters or fewer'),
    description: z
      .string()
      .trim()
      .min(1, 'Description is required')
      .max(5000, 'Description must be 5000 characters or fewer'),
    category: z.enum(BOUNTY_CATEGORIES),
    country: z.union([z.string(), z.null()]).optional(),
    githubIssueUrl: z
      .union([z.string().url('Enter a valid URL'), z.literal(''), z.null()])
      .optional()
      .transform(v => (v === '' ? null : v)),
    projectId: z.union([z.string(), z.null()]).optional(),
    bountyWindowId: z.union([z.string(), z.null()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'DEVELOPMENT' && !data.githubIssueUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['githubIssueUrl'],
        message: 'A GitHub issue URL is required for development bounties',
      });
    }
  });

export type ScopeFormData = z.input<typeof scopeSchema>;
