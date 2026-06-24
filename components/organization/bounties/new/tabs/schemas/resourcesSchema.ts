import { z } from 'zod';

/**
 * Resources step: optional links and/or uploaded files (PDF/DOC/PPT) the
 * organizer shares with contributors. Mirrors the hackathon resources schema.
 * Each row needs either a link or a file; the step itself is optional.
 */
export const resourceItemSchema = z
  .object({
    id: z.string(),
    link: z.string().optional().or(z.literal('')),
    description: z.string().trim().optional().or(z.literal('')),
    file: z
      .object({
        url: z.string().url(),
        name: z.string(),
      })
      .optional(),
  })
  .refine(data => (data.link && data.link.trim() !== '') || !!data.file, {
    message: 'Either a link or a file must be provided',
    path: ['link'],
  })
  .refine(
    data => {
      if (!data.link || data.link.trim() === '') return true;
      try {
        new URL(data.link);
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Please enter a valid URL', path: ['link'] }
  );

export const resourcesSchema = z.object({
  resources: z.array(resourceItemSchema).default([]),
});

export type ResourceItem = z.infer<typeof resourceItemSchema>;
export type ResourcesFormData = z.input<typeof resourcesSchema>;
