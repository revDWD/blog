/**
 * Share images (1200×630 PNG), rendered at build time with resvg and bundled TTF fonts, so they
 * build identically on any machine. Each entry's image shows its own star highlighted in its
 * constellation: every share is a small advert for the atlas.
 */
import { Resvg } from "@resvg/resvg-js";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import type { Atlas, Star, Glyph } from "./atlas";

const require = createRequire(import.meta.url);
const font = (p: string) => readFileSync(require.resolve(p));
let fonts: Buffer[] | null = null;
const loadFonts = () =>
  (fonts ??= [
    font("@expo-google-fonts/newsreader/300Light/Newsreader_300Light.ttf"),
    font("@expo-google-fonts/newsreader/400Regular/Newsreader_400Regular.ttf"),
    font("@expo-google-fonts/newsreader/400Regular_Italic/Newsreader_400Regular_Italic.ttf"),
    font("@expo-google-fonts/ibm-plex-mono/400Regular/IBMPlexMono_400Regular.ttf"),
  ]);

const C = { paper: "#f4eee1", deep: "#ebe3d1", ink: "#211f1c", muted: "#5a5347", rule: "#d3c8b0", coral: "#b3401f", line: "#8a806d" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function glyph(g: Glyph, x: number, y: number, r: number) {
  const t = `transform="translate(${x} ${y})"`;
  switch (g) {
    case "idea": return `<circle ${t} r="${r}" fill="${C.paper}" stroke="${C.ink}" stroke-width="${r * 0.18}" stroke-dasharray="${r * 0.55} ${r * 0.45}"/>`;
    case "survey": return `<g ${t}><circle r="${r}" fill="${C.paper}" stroke="${C.ink}" stroke-width="${r * 0.18}"/><circle r="${r * 0.32}" fill="${C.ink}"/></g>`;
    case "bench": return `<g ${t}><circle r="${r + 4}" fill="none" stroke="${C.coral}" stroke-width="1.5"/><circle r="${r}" fill="${C.coral}"/></g>`;
    case "paused": return `<g ${t}><circle r="${r}" fill="${C.paper}" stroke="${C.ink}" stroke-width="${r * 0.18}"/><path d="M0 ${-r}A${r} ${r} 0 0 0 0 ${r}Z" fill="${C.ink}"/></g>`;
    case "evolving": return `<g ${t}><ellipse rx="${r + 6}" ry="${(r + 6) * 0.42}" fill="none" stroke="${C.ink}" stroke-width="1.2" transform="rotate(-28)"/><circle r="${r * 0.82}" fill="${C.ink}"/></g>`;
    default: return `<g ${t}><circle r="${r + 3.5}" fill="none" stroke="${C.ink}" stroke-width="1" opacity=".4"/><circle r="${r}" fill="${C.ink}"/></g>`;
  }
}

function wrap(text: string, max: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

/** The sky panel: a framed piece of the atlas (one constellation, or all of it). */
function skyPanel(atlas: Atlas, opts: { field?: string; highlight?: string; x: number; y: number; w: number; h: number }) {
  const { field, highlight, x, y, w, h } = opts;
  let vb: [number, number, number, number];
  if (field) {
    const c = atlas.constellations.find((k) => k.id === field)!;
    const size = Math.max(260, c.radius * 3.4);
    vb = [c.cx - (size * w) / h / 2, c.cy - size / 2, (size * w) / h, size];
  } else vb = [0, 0, 1600, 1000];
  const sx = w / vb[2];
  const P = (px: number, py: number) => [x + (px - vb[0]) * sx, y + (py - vb[1]) * sx] as const;
  const parts: string[] = [];
  for (let i = 1; i < 8; i++) parts.push(`<line x1="${x + (i * w) / 8}" y1="${y}" x2="${x + (i * w) / 8}" y2="${y + h}" stroke="${C.rule}" stroke-width="1" stroke-opacity=".55"/>`);
  for (let i = 1; i < 5; i++) parts.push(`<line x1="${x}" y1="${y + (i * h) / 5}" x2="${x + w}" y2="${y + (i * h) / 5}" stroke="${C.rule}" stroke-width="1" stroke-opacity=".55"/>`);
  for (const c of atlas.constellations) {
    const dim = field && c.id !== field ? 0.25 : 1;
    for (const [x1, y1, x2, y2] of c.lines) {
      const a = P(x1, y1), b = P(x2, y2);
      parts.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.line}" stroke-width="1.5" stroke-opacity="${dim}"/>`);
    }
    const [lx, ly] = P(c.cx, c.labelY);
    if (lx > x && lx < x + w && ly > y + 10 && ly < y + h)
      parts.push(`<text x="${lx}" y="${ly}" text-anchor="middle" font-family="Newsreader" font-style="italic" font-size="${field ? 30 : 17}" fill="${C.ink}" opacity="${dim}">${esc(c.name)}</text>`);
  }
  const scaleR = field ? Math.min(2.2, sx * 1.1) : sx * 1.15;
  for (const s of atlas.stars) {
    const [px, py] = P(s.x, s.y);
    if (px < x - 20 || px > x + w + 20 || py < y - 20 || py > y + h + 20) continue;
    const dim = field && s.field !== field ? 0.3 : 1;
    if (s.id === highlight) parts.push(`<circle cx="${px}" cy="${py}" r="${s.r * scaleR + 16}" fill="none" stroke="${C.coral}" stroke-width="2"/>`);
    parts.push(`<g opacity="${dim}">${glyph(s.glyph, px, py, s.r * scaleR)}</g>`);
  }
  const id = `clip${Math.round(x)}${Math.round(y)}`;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><g clip-path="url(#${id})">${parts.join("")}</g>`;
}

export function ogEntry(atlas: Atlas, star: Star, kicker: string) {
  const title = wrap(star.title, 22).slice(0, 3);
  const dek = wrap(star.dek, 46).slice(0, 3);
  const titleSize = title.length > 2 ? 58 : 68;
  let y = 150;
  const t = title.map((l, i) => `<text x="64" y="${y + i * titleSize * 1.02}" font-family="Newsreader" font-weight="300" font-size="${titleSize}" fill="${C.ink}" letter-spacing="-1.5">${esc(l)}</text>`).join("");
  y += title.length * titleSize * 1.02 + 18;
  const dk = dek.map((l, i) => `<text x="64" y="${y + i * 32}" font-family="Newsreader" font-style="italic" font-size="25" fill="${C.muted}">${esc(l)}</text>`).join("");
  return render(`
    ${frameSvg()}
    <text x="64" y="86" font-family="IBM Plex Mono" font-size="19" fill="${C.muted}">${esc(kicker)}</text>
    ${t}${dk}
    <rect x="640" y="48" width="512" height="534" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>
    ${skyPanel(atlas, { field: star.field, highlight: star.id, x: 641, y: 49, w: 510, h: 532 })}
    <text x="64" y="574" font-family="Newsreader" font-size="27" fill="${C.ink}">Abby<tspan fill="${C.coral}" font-style="italic"> + </tspan>David <tspan fill="${C.muted}" font-style="italic">Workshop</tspan></text>
  `);
}

export function ogDefault(atlas: Atlas) {
  return render(`
    ${frameSvg()}
    <text x="64" y="86" font-family="IBM Plex Mono" font-size="19" fill="${C.muted}">The Abby + David workshop · blog.abbydavid.com</text>
    <text x="64" y="160" font-family="Newsreader" font-weight="300" font-size="62" fill="${C.ink}" letter-spacing="-1.5">Everything we make,</text>
    <text x="64" y="222" font-family="Newsreader" font-style="italic" font-size="62" fill="${C.ink}" letter-spacing="-1.5">charted as stars.</text>
    <rect x="64" y="262" width="1072" height="320" fill="${C.paper}" stroke="${C.ink}" stroke-width="1.5"/>
    ${skyPanel(atlas, { x: 65, y: 263, w: 1070, h: 318 })}
  `);
}

const frameSvg = () => `<rect width="1200" height="630" fill="${C.paper}"/><rect x="20" y="20" width="1160" height="590" fill="none" stroke="${C.rule}" stroke-width="1.5"/><rect x="0" y="0" width="56" height="5" fill="${C.coral}" transform="translate(64 34)"/>`;

function render(inner: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">${inner}</svg>`;
  if (process.env.OG_DEBUG) require("node:fs").writeFileSync("/tmp/og-last.svg", svg);
  const r = new Resvg(svg, { font: { fontBuffers: loadFonts(), loadSystemFonts: false, defaultFontFamily: "Newsreader" }, fitTo: { mode: "width", value: 1200 } });
  return r.render().asPng();
}
