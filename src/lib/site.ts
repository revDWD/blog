/** Site-wide vocabulary. Add a category here before using it in a project's frontmatter. */

export const CATEGORIES = [
  { id: "games", label: "Games" },
  { id: "science", label: "Science" },
  { id: "outdoors", label: "Outdoors" },
  { id: "civic", label: "Civic" },
  { id: "humor", label: "Humor" },
  { id: "software", label: "Software" },
  { id: "hardware", label: "Hardware" },
  { id: "writing", label: "Writing" },
] as const;
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [string, ...string[]];
export const categoryLabel = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

/** The same types abbydavid.com uses in its catalogue lines. */
export const KINDS = ["Project", "Experiment", "Tool", "Build", "Guide", "Trip"] as const;

/** Status, as shown on abbydavid.com ("Live", "Concept") plus the usual workshop states. */
export const STATUSES = ["live", "in-progress", "concept", "paused", "archived"] as const;
export const STATUS_LABEL: Record<(typeof STATUSES)[number], string> = {
  live: "Live",
  "in-progress": "In progress",
  concept: "Concept",
  paused: "Paused",
  archived: "Archived",
};
/** Shown on the home page under "On the bench". */
export const ACTIVE = new Set(["in-progress", "concept"]);
