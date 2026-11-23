import { getCollection, type CollectionEntry } from "astro:content";
import { buildAtlas, type Atlas } from "./atlas";

/**
 * Sample (placeholder) content ships with the starter so the atlas has something to show.
 * Build with INCLUDE_SAMPLES=false to strip every entry, log, note and bench item marked `sample: true`.
 */
const env = (typeof process !== "undefined" && process.env) || {};
export const INCLUDE_SAMPLES = (import.meta.env.INCLUDE_SAMPLES ?? env.INCLUDE_SAMPLES ?? "true") !== "false";
const keep = (d: { draft?: boolean; sample?: boolean }) =>
  !(import.meta.env.PROD && d.draft) && (INCLUDE_SAMPLES || !d.sample);

export async function getEntries() {
  return (await getCollection("entries", (e) => keep(e.data))).sort((a, b) => b.data.no - a.data.no);
}
export async function getFields() {
  return await getCollection("fields");
}
export async function getLogs() {
  return (await getCollection("logs", (e) => keep(e.data))).sort((a, b) => +b.data.date - +a.data.date);
}
export async function getNotes() {
  return (await getCollection("notes", (e) => keep(e.data))).sort((a, b) => +b.data.date - +a.data.date);
}
export async function getBench() {
  const ids = new Set((await getEntries()).map((e) => e.id));
  return (await getCollection("bench"))
    .sort((a, b) => a.data.order - b.data.order)
    .map((s) => ({
      ...s,
      data: {
        ...s.data,
        items: s.data.items.filter((i) => (INCLUDE_SAMPLES || !i.sample) && (!i.entry || ids.has(i.entry.id))),
      },
    }));
}

let atlasCache: Promise<Atlas> | null = null;
export function getAtlas() {
  atlasCache ??= (async () => buildAtlas(await getEntries(), await getFields()))();
  return atlasCache;
}

/** Reference ids, whether Astro resolved them to { id } or left a default as a plain string. */
export const ids = (list: ({ id: string } | string)[]) => list.map((x) => (typeof x === "string" ? x : x.id));

export const tended = (e: CollectionEntry<"entries">) => e.data.updated ?? e.data.started;

/* ---------- formatting ---------- */
export const no = (n: number) => `No. ${String(n).padStart(2, "0")}`;
export const monthYear = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export const fullDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const shortDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
export const iso = (d: Date) => d.toISOString().slice(0, 10);

export const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  researching: "Researching",
  exploring: "Exploring",
  building: "Building",
  "in-progress": "In progress",
  paused: "Paused",
  completed: "Completed",
  evolving: "Evolving",
};
export const KIND_LABEL: Record<string, string> = {
  project: "Project",
  experiment: "Experiment",
  research: "Research",
  build: "Build",
  trip: "Trip",
  essay: "Essay",
  tool: "Tool",
  demo: "Demo",
  gallery: "Gallery",
  video: "Video",
};
/** Kinds that move through build stages get the status instrument; essays and trips don't. */
export const STAGED_KINDS = new Set(["project", "experiment", "research", "build", "tool", "demo"]);

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}
