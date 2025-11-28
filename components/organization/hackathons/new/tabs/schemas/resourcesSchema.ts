import { z } from 'zod';

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
  .refine(
    data => {
      const hasLink = data.link && data.link.trim() !== '';
      const hasFile = !!data.file;
      return hasLink || hasFile;
    },
    {
      message: 'Either a link or a file must be provided',
      path: ['link'],
    }
  )
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
    {
      message: 'Please enter a valid URL',
      path: ['link'],
    }
  );

export const resourcesSchema = z.object({
  resources: z.array(resourceItemSchema).default([]),
});

export type ResourceItem = z.infer<typeof resourceItemSchema>;
export type ResourcesFormData = z.input<typeof resourcesSchema>;
