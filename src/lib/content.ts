import { getCollection, type CollectionEntry } from "astro:content";

export type Project = CollectionEntry<"projects">;

const visible = (d: { draft?: boolean }) => !(import.meta.env.PROD && d.draft);

/** Newest catalogue number first, like the abbydavid.com archive. */
export async function getProjects() {
  return (await getCollection("projects", (p) => visible(p.data))).sort((a, b) => b.data.no - a.data.no);
}

export const no = (n: number) => `No. ${String(n).padStart(2, "0")}`;
export const monthYear = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
export const fullDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const iso = (d: Date) => d.toISOString().slice(0, 10);
