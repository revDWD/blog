import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { CATEGORY_IDS, KINDS, STATUSES } from "./lib/site";

/** One file per project: src/content/projects/<slug>.md(x) → /projects/<slug>/ */
const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/projects" }),
  schema: z.object({
    no: z.number().int().positive(), // catalogue number, shared with abbydavid.com ("No. 04")
    title: z.string(),
    summary: z.string(), // what it is, in one sentence
    kind: z.enum(KINDS).default("Project"),
    status: z.enum(STATUSES),
    categories: z.array(z.enum(CATEGORY_IDS)).min(1),
    started: z.coerce.date(),
    updated: z.coerce.date().optional(),
    stack: z.array(z.string()).default([]), // technologies; leave empty rather than guess
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    image: z
      .object({ src: z.string(), alt: z.string(), width: z.number(), height: z.number(), pixel: z.boolean().default(false) })
      .optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});


export const collections = { projects };
