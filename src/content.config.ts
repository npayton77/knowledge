import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    source: z.enum(['chatgpt', 'claude', 'manual']).default('manual'),
    summary: z.string().optional(),
  }),
});

export const collections = { posts };
