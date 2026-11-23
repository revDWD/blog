/**
 * The atlas layout engine.
 *
 * Deterministic by design: a star's position depends only on its accession number (`no`), its
 * field, and how many entries share that field. Nothing is random at render time, so the chart
 * looks the same on every visit and new work grows outward from each constellation's heart.
 */
import type { CollectionEntry } from "astro:content";

export const W = 1600;
export const H = 1000;
const GOLDEN = Math.PI * (3 - Math.sqrt(5)); // ≈137.5°

export type Glyph = "idea" | "survey" | "bench" | "paused" | "complete" | "evolving";

export const GLYPH_OF: Record<string, Glyph> = {
  idea: "idea",
  researching: "survey",
  exploring: "survey",
  building: "bench",
  "in-progress": "bench",
  paused: "paused",
  completed: "complete",
  evolving: "evolving",
};

export const GLYPH_LABEL: Record<Glyph, string> = {
  idea: "Idea",
  survey: "Researching / exploring",
  bench: "On the bench",
  paused: "Paused",
  complete: "Completed",
  evolving: "Evolving",
};

export interface Star {
  id: string;
  no: number;
  title: string;
  dek: string;
  status: string;
  glyph: Glyph;
  field: string;
  fieldName: string;
  x: number;
  y: number;
  r: number;
  href: string;
  updated: string; // ISO
  started: string;
  labelled: boolean;
  pulse: boolean;
  related: string[];
  alsoIn: string[];
  label: { x: number; y: number; anchor: "start" | "end" | "middle" }; // offset from the star
  rank: number; // position within its field (1-based)
  of: number; // stars in its field
}

export interface Constellation {
  id: string;
  name: string;
  description: string;
  cx: number;
  cy: number;
  radius: number;
  count: number;
  labelY: number;
  lines: [number, number, number, number][];
}

export interface Atlas {
  stars: Star[];
  constellations: Constellation[];
  uncharted: { id: string; name: string }[];
  threads: { a: string; b: string; d: string }[];
  epoch: string;
}

/** Tiny seeded PRNG, so "random" decoration is identical on every build. */
export function seeded(seedText: string) {
  let h = 1779033703 ^ seedText.length;
  for (let i = 0; i < seedText.length; i++) {
    h = Math.imul(h ^ seedText.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Minimum spanning tree (Prim). Gives each field a constellation figure, never a hairball. */
function mst(pts: { x: number; y: number }[]): [number, number][] {
  if (pts.length < 2) return [];
  const inTree = new Set([0]);
  const edges: [number, number][] = [];
  while (inTree.size < pts.length) {
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (const i of inTree)
      for (let j = 0; j < pts.length; j++) {
        if (inTree.has(j)) continue;
        const d = (pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2;
        if (d < bestD) (bestD = d), (best = [i, j]);
      }
    edges.push(best!);
    inTree.add(best![1]);
  }
  return edges;
}

function magnitude(e: CollectionEntry<"entries">): number {
  if (e.data.magnitude) return e.data.magnitude;
  const words = (e.body ?? "").split(/\s+/).length;
  return Math.max(1, Math.min(5, 1 + Math.log2(1 + words / 180)));
}

export function buildAtlas(
  entries: CollectionEntry<"entries">[],
  fields: CollectionEntry<"fields">[],
): Atlas {
  const byField = new Map<string, CollectionEntry<"entries">[]>();
  for (const e of entries) {
    const f = e.data.field.id;
    if (!byField.has(f)) byField.set(f, []);
    byField.get(f)!.push(e);
  }

  const charted = fields.filter((f) => byField.has(f.id));
  const uncharted = fields.filter((f) => !byField.has(f.id)).map((f) => ({ id: f.id, name: f.data.name }));

  // Each constellation gets a reserved region; spacing tightens as the busiest field fills,
  // so neighbouring constellations never run into each other.
  const REGION = 150;
  const busiest = Math.max(1, ...[...byField.values()].map((l) => l.length));
  const spacing = Math.min(44, (REGION - 18) / Math.sqrt(busiest + 0.6));

  // The most recently tended build is the only thing on the chart that moves.
  const benchStars = entries
    .filter((e) => GLYPH_OF[e.data.status] === "bench")
    .sort((a, b) => +(b.data.updated ?? b.data.started) - +(a.data.updated ?? a.data.started));
  const pulseId = benchStars[0]?.id;

  const stars: Star[] = [];
  const constellations: Constellation[] = [];

  charted.forEach((f, fi) => {
    const list = byField.get(f.id)!.slice().sort((a, b) => a.data.no - b.data.no);
    const rand = seeded(f.id);
    const cx = (f.data.x ?? 0.15 + 0.7 * ((fi * 0.618) % 1)) * W;
    const cy = (f.data.y ?? 0.2 + 0.6 * ((fi * 0.382) % 1)) * H;
    // Per-field character: rotation and stretch, so no two figures look alike.
    const rot = rand() * Math.PI * 2;
    const stretch = 0.72 + rand() * 0.5;
    const tilt = rand() * Math.PI;

    const pts = list.map((e, i) => {
      const rr = spacing * Math.sqrt(i + 0.35) * (0.85 + rand() * 0.3);
      const th = i * GOLDEN + rot;
      let x = Math.cos(th) * rr * stretch;
      let y = Math.sin(th) * rr;
      const xr = x * Math.cos(tilt) - y * Math.sin(tilt);
      const yr = x * Math.sin(tilt) + y * Math.cos(tilt);
      return { x: cx + xr, y: cy + yr };
    });

    const radius = Math.max(36, ...pts.map((p) => Math.hypot(p.x - cx, p.y - cy))) + 10;
    const lines = mst(pts).map(([a, b]) => [pts[a].x, pts[a].y, pts[b].x, pts[b].y] as [number, number, number, number]);

    list.forEach((e, i) => {
      const glyph = GLYPH_OF[e.data.status];
      const mag = magnitude(e);
      stars.push({
        id: e.id,
        no: e.data.no,
        title: e.data.title,
        dek: e.data.dek,
        status: e.data.status,
        glyph,
        field: f.id,
        fieldName: f.data.name,
        x: +pts[i].x.toFixed(1),
        y: +pts[i].y.toFixed(1),
        r: +(4.6 + mag * 1.9).toFixed(1),
        href: `/projects/${e.id}/`,
        updated: (e.data.updated ?? e.data.started).toISOString(),
        started: e.data.started.toISOString(),
        labelled: e.data.featured || glyph === "bench" || list.length <= 2,
        pulse: e.id === pulseId,
        related: e.data.related.map((r) => r.id),
        alsoIn: e.data.fields.map((x) => x.id),
        label: { x: 0, y: 0, anchor: "start" },
        rank: i + 1,
        of: list.length,
      });
    });

    constellations.push({
      id: f.id,
      name: f.data.name,
      description: f.data.description,
      cx: +cx.toFixed(1),
      cy: +cy.toFixed(1),
      radius: +radius.toFixed(1),
      count: list.length,
      labelY: +(cy - radius - 14).toFixed(1),
      lines,
    });
  });

  placeLabels(stars, constellations);

  // Threads: explicit `related` links, drawn as gentle arcs. Shown only for the star in focus.
  const pos = new Map(stars.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const threads: Atlas["threads"] = [];
  for (const s of stars)
    for (const r of s.related) {
      const t = pos.get(r);
      if (!t) continue;
      const key = [s.id, r].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const mx = (s.x + t.x) / 2;
      const my = (s.y + t.y) / 2;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const bend = 0.18;
      const qx = mx - dy * bend;
      const qy = my + dx * bend;
      threads.push({ a: s.id, b: r, d: `M${s.x} ${s.y}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${t.x} ${t.y}` });
    }

  const latest = entries.reduce((m, e) => Math.max(m, +(e.data.updated ?? e.data.started)), 0);
  const d = new Date(latest || Date.now());
  const epoch = `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

  return { stars, constellations, uncharted, threads, epoch };
}

/**
 * Label placement: right, left, below or above each star, whichever collides least with labels
 * already placed, other stars and constellation names. Greedy, by accession number.
 */
function placeLabels(stars: Star[], constellations: Constellation[]) {
  type Box = [number, number, number, number];
  const hit = (a: Box, b: Box) => {
    const w = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
    const h = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
    return w > 0 && h > 0 ? w * h : 0;
  };
  const placed: Box[] = constellations.map((c) => {
    const w = c.name.length * 13 + 10;
    return [c.cx - w / 2, c.labelY - 24, c.cx + w / 2, c.labelY + 20] as Box;
  });
  const dots: Box[] = stars.map((s) => [s.x - s.r - 3, s.y - s.r - 3, s.x + s.r + 3, s.y + s.r + 3]);
  for (const s of [...stars].sort((a, b) => a.no - b.no)) {
    const w = (s.title.length + 3) * 8.6 + 8;
    const g = s.r + 10;
    const options = [
      { x: g, y: 5, anchor: "start" as const, box: [s.x + g, s.y - 11, s.x + g + w, s.y + 8] as Box },
      { x: -g, y: 5, anchor: "end" as const, box: [s.x - g - w, s.y - 11, s.x - g, s.y + 8] as Box },
      { x: 0, y: s.r + 24, anchor: "middle" as const, box: [s.x - w / 2, s.y + s.r + 8, s.x + w / 2, s.y + s.r + 28] as Box },
      { x: 0, y: -(s.r + 12), anchor: "middle" as const, box: [s.x - w / 2, s.y - s.r - 28, s.x + w / 2, s.y - s.r - 8] as Box },
    ];
    const cost = (o: (typeof options)[number], i: number) => {
      let c = i * 30; // mild preference for the right, then left
      for (const b of placed) c += hit(o.box, b);
      for (const [k, d] of dots.entries()) if (stars[k] !== s) c += hit(o.box, d) * 4;
      if (o.box[0] < 20 || o.box[2] > W - 20) c += 1e6;
      return c;
    };
    let best = options[0], bestC = Infinity;
    options.forEach((o, i) => { const c = cost(o, i); if (c < bestC) (bestC = c), (best = o); });
    s.label = { x: best.x, y: best.y, anchor: best.anchor };
    placed.push(best.box);
  }
}

/** A viewBox that frames one constellation (plus margin), for plates and field pages. */
export function frame(c: Pick<Constellation, "cx" | "cy" | "radius">, pad = 1.9, aspect = 16 / 10, minH = 400) {
  const h = Math.max(minH, c.radius * 2 * pad);
  const w = h * aspect;
  return `${(c.cx - w / 2).toFixed(1)} ${(c.cy - h / 2 - 8).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
}

/** Field-star dust: faint decorative points, identical on every build. */
export function dust(count = 150) {
  const rand = seeded("dust");
  return Array.from({ length: count }, () => ({
    x: +(rand() * W).toFixed(1),
    y: +(rand() * H).toFixed(1),
    r: +(0.4 + rand() * rand() * 1.4).toFixed(2),
  }));
}
