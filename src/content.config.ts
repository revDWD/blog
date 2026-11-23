import { defineCollection, reference } from "astro:content";
import { glob, file } from "astro/loaders";
import { z } from "astro/zod";

/** Every status a piece of work can be in. Order matters: it is the "status instrument" track. */
export const STATUSES = [
  "idea",
  "researching",
  "exploring",
  "building",
  "in-progress",
  "paused",
  "completed",
  "evolving",
] as const;

/** What sort of thing an entry is. New kinds (demo, gallery, video…) slot in here without a redesign. */
export const KINDS = [
  "project",
  "experiment",
  "research",
  "build",
  "trip",
  "essay",
  "tool",
  "demo",
  "gallery",
  "video",
] as const;

const image = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  caption: z.string().optional(),
  pixel: z.boolean().default(false),
});

/** Constellations. Optional x/y (0–1) pins a constellation to a spot on the chart. */
const fields = defineCollection({
  loader: file("src/content/fields.yaml"),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    x: z.number().min(0).max(1).optional(),
    y: z.number().min(0).max(1).optional(),
  }),
});

const authors = defineCollection({
  loader: file("src/content/authors.yaml"),
  schema: z.object({
    name: z.string(),
    url: z.string().url().optional(),
    bio: z.string().optional(),
  }),
});

/** The stars. One file per dossier. */
const entries = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/entries" }),
  schema: z.object({
    no: z.number().int().positive(), // accession number: permanent, decides the star's position
    title: z.string(),
    dek: z.string(),
    kind: z.enum(KINDS).default("project"),
    field: reference("fields"),
    fields: z.array(reference("fields")).default([]),
    tags: z.array(z.string()).default([]),
    status: z.enum(STATUSES),
    pausedAt: z.enum(["idea", "researching", "exploring", "building"]).optional(),
    started: z.coerce.date(),
    updated: z.coerce.date().optional(),
    authors: z.array(reference("authors")).default(["abby", "david"]),
    related: z.array(reference("entries")).default([]),
    hero: image.optional(),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
    stack: z.array(z.string()).default([]),
    magnitude: z.number().min(1).max(5).optional(), // star size override (5 = brightest)
    featured: z.boolean().default(false),
    sample: z.boolean().default(false), // placeholder content: stamped on the page, can be stripped at build
    draft: z.boolean().default(false),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

/** Progress-journal posts that belong to one entry. */
const logs = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/logs" }),
  schema: z.object({
    title: z.string(),
    entry: reference("entries"),
    date: z.coerce.date(),
    summary: z.string(),
    sample: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/** Short workshop notes: a sentence or a paragraph. */
const notes = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/notes" }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
    entry: reference("entries").optional(),
    author: reference("authors").optional(),
    sample: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

/** The bench: what's being built now, next, long-term. Edited in one YAML file. */
const bench = defineCollection({
  loader: file("src/content/bench.yaml"),
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
    order: z.number(),
    items: z.array(
      z.object({
        title: z.string(),
        note: z.string().optional(),
        entry: reference("entries").optional(),
        href: z.string().optional(),
        sample: z.boolean().default(false),
      }),
    ),
  }),
});

export const collections = { fields, authors, entries, logs, notes, bench };
