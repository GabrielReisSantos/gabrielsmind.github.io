import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const reports = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/reports" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    type: z.string(),
    date: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { reports };
