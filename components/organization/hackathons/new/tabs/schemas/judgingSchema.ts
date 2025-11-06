import { z } from 'zod';

export const criterionSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Criterion name is required'),
  weight: z.number().min(0).max(100),
  description: z.string().optional(),
});

export const judgingSchema = z
  .object({
    criteria: z
      .array(criterionSchema)
      .min(1, 'At least one judging criterion is required'),
  })
  .superRefine((data, ctx) => {
    // Ensure weights sum to 100%
    const totalWeight = data.criteria.reduce((sum, criterion) => {
      return sum + criterion.weight;
    }, 0);

    if (Math.abs(totalWeight - 100) > 0.01) {
      // Find the first criterion to attach the error to
      const firstCriterionIndex = data.criteria.length > 0 ? 0 : -1;
      if (firstCriterionIndex >= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Total weight must equal 100% (currently ${totalWeight.toFixed(1)}%)`,
          path: ['criteria', firstCriterionIndex, 'weight'],
        });
      }
    }
  });

export type Criterion = z.infer<typeof criterionSchema>;
export type JudgingFormData = z.input<typeof judgingSchema>;
