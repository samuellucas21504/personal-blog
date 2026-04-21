import { z } from "zod";

export const postInputSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(3)
    .max(200)
    .transform((s) => s.trim().toLowerCase())
    .refine((s) => /^[a-z0-9-]+$/.test(s), "Slug deve conter apenas letras minúsculas, números e hífens."),
  excerpt: z.string().min(1).max(320),
  markdownContent: z.string().min(1),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  coverImageUrl: z.string().max(2000).nullable().optional(),
  seoTitle: z.string().max(160).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
  regenerateSlugFromTitle: z.boolean().optional(),
});

export const createPostTitleSchema = z.object({
  title: z.string().min(1).max(160),
});

export const commentInputSchema = z.object({
  displayName: z.string().min(1).max(80).trim(),
  body: z.string().min(1).max(4000).trim(),
});
