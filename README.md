# Abby + David Workshop · blog.abbydavid.com

A project journal that works like a place: **everything you make, charted as stars**.
Fields are constellations, entries are stars, and each star opens a dossier.
The design reasoning (concepts, wireframes, flows, critique and decisions) is in [`DESIGN.md`](./DESIGN.md).

```
npm install
npm run dev          # http://localhost:4321
npm run build        # static site → dist/
npm run build:clean  # same, with every `sample: true` item stripped
```

**Deploy (Cloudflare Pages or any static host):** build command `npm run build`, output directory `dist`. Astro needs **Node 22.23.4 or newer**: the repo pins it in `.node-version`, and on Cloudflare you can also set the `NODE_VERSION` environment variable to `22.23.5`.
No server and no environment variables are required. `INCLUDE_SAMPLES=false` strips the placeholder content.

---

## Adding work

### A new entry (a star)
Copy `src/content/entries/_template.mdx` to `src/content/entries/<slug>.mdx`. The URL becomes `/projects/<slug>/`.

```yaml
no: 14                 # next accession number. Permanent: it decides where the star sits.
title: …
dek: One sentence. Shown on the card, in the ledger and in search results.
kind: project          # project | experiment | research | build | trip | essay | tool | demo | gallery | video
field: engineering     # the constellation (an id from src/content/fields.yaml)
fields: [ai]           # also appears in…
tags: [robotics]
status: building       # idea | researching | exploring | building | in-progress | paused | completed | evolving
pausedAt: building     # only when status is paused
started: 2026-12-01
updated: 2026-12-04    # "last tended": change it whenever you touch the project
authors: [abby]        # default: both
related: [ecotox-id]   # threads on the atlas
hero: { src, alt, width, height, caption, pixel }   # optional; without it, the entry's constellation plate is used
links: [{ label: Open it, href: https://… }]
stack: [Astro, …]
featured: false        # always label this star on the atlas
magnitude: 3           # optional star size, 1–5 (by default it grows with the length of the write-up)
```

**Status glyphs** (always shown with their text label):
- ◌ dashed ring: idea
- ⊙ ring with ticks: researching / exploring
- coral disc: building / in progress. Only the most recently tended build pulses.
- ◐ half disc: paused
- ● solid disc: completed
- orbit ring: evolving

### Dossier components (MDX, no imports needed)
```mdx
<Figure src="/media/x.jpg" alt="…" width={1600} height={900} caption="…" />
<Gallery columns={3} caption="…"> <Figure …/> <Figure …/> </Gallery>
<Compare before={{src, alt}} after={{src, alt}} width={1200} height={750} labels={["Before","After"]} caption="…" />
<Video youtube="VIDEO_ID" title="…" />            or  <Video src="/media/clip.mp4" poster="…" title="…" />
<Log> <LogEntry date="2026-12-01" title="…" status="Building">…</LogEntry> </Log>
<Note kind="lesson">…</Note>   <Note kind="failure">…</Note>   <Note kind="next">…</Note>   <Note kind="aside">margin note</Note>
```
Code blocks use fenced Markdown and follow the light/dark theme. Figures are numbered automatically: Fig. 1 is the hero.

### Other content
- **Build logs** (`src/content/logs/*.md(x)`): dated progress posts with `entry: <slug>`. They appear in the dossier's journal and at `/logs/<slug>/`.
- **Workshop notes** (`src/content/notes/*.md`): a sentence or a paragraph, at `/notes/`.
- **The bench** (`src/content/bench.yaml`): On the bench, Next up, Long-term pursuits and Ideas. The homepage shows the first two.
- **Constellations** (`src/content/fields.yaml`): add a field with `name`, `description` and optional `x`/`y` (0–1) to pin it on the chart. A field with no entries isn't drawn; it's listed as "uncharted".

### Sample content
Seven entries, one log, two notes and some bench items are **samples**, marked `sample: true`. They carry a visible "Sample" stamp, are `noindex`, and are left out of RSS. Replace or delete them, or build with `npm run build:clean`.
Entries No. 01–04 are seeded from the abbydavid.com project archive, using the descriptions already written there. Each has an `EDITOR` comment where the story still needs writing. No. 05 (*The Workshop Atlas*) documents this site's design.

---

## Connecting it to abbydavid.com

1. **Add the workshop to the main nav** (abbydavid.com `index.html` and the other pages):
   ```html
   <li><a href="https://blog.abbydavid.com/">Workshop</a></li>
   ```
2. **Share the theme choice across subdomains.** The blog already reads and writes the same `abbydavid-theme` key and a `.abbydavid.com` cookie. To make the main site honour it as well, in `theme.js` add one line inside the click handler, after `localStorage.setItem(KEY, next)`:
   ```js
   document.cookie = "abbydavid-theme=" + next + "; Domain=.abbydavid.com; Path=/; Max-Age=31536000; SameSite=Lax; Secure";
   ```
   and in the inline `<head>` script, check the cookie before localStorage:
   ```js
   var m=document.cookie.match(/(?:^|; )abbydavid-theme=(light|dark)/); t=m?m[1]:localStorage.getItem("abbydavid-theme");
   ```
The design tokens (colours, Newsreader / Atkinson Hyperlegible Next / IBM Plex Mono, rules, link underlines, section ribbons) are copied from `abbydavid.com/styles.css`, so the two sites read as one place.

---

## How it's built

| | |
|---|---|
| Framework | Astro (static output), MDX, content collections with typed schemas (`src/content.config.ts`) |
| The atlas | `src/lib/atlas.ts` computes the layout **at build time**: golden-angle spirals by accession number, a minimum-spanning-tree figure per field, spacing that tightens as fields fill. `SkyView.astro` renders real SVG with real links. |
| Interaction | `src/scripts/atlas.ts` (progressive): one tab stop with roving focus, arrow keys to the nearest star, `[` `]` to jump constellations, Home/End, Esc; specimen card; glide-zoom ("Fly to"); related threads; graticule parallax; "since your last visit" line |
| Phones | The chart becomes a still thumbnail (`inert`), followed by one strip per constellation |
| Motion | Draw-in once per session, one pulse, CSS cross-document view transitions, a scroll-driven hero drift. All off with `prefers-reduced-motion`. |
| SEO | Canonical URLs, per-entry OG images (`/og/<slug>.png`, the entry's star highlighted in its constellation, rendered with resvg), JSON-LD, sitemap, RSS, robots |
| Fonts | Self-hosted woff2 (`public/fonts`). The OG renderer uses TTFs from `@expo-google-fonts`. |

### Routes
`/` atlas · `/projects/<slug>/` dossier · `/fields/<field>/` constellation · `/tags/<tag>/` · `/ledger/` (filterable, `?field=&status=&kind=`) · `/bench/` · `/notes/` · `/notes/<slug>/` · `/logs/<slug>/` · `/rss.xml` · `/sitemap-index.xml`

### Growing it
- **New kinds** (demo, gallery, video…) are already in the schema: they get a star, a dossier and a ledger row. To give a kind its own layout, branch on `entry.data.kind` in `src/pages/projects/[slug].astro`.
- **An interactive lab** (`/lab/<slug>/`): add `src/pages/lab/[slug].astro` that reads entries with `kind: demo` and mounts the demo. The star links can point there by changing `href` in `buildAtlas` for that kind.
- **Hundreds of entries**: spacing tightens automatically, labels hide until hover or zoom, and the ledger filters.
