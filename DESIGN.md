# blog.abbydavid.com — design dossier

*Concepts, wireframes, flows, trade-offs and the chosen direction for the Abby + David workshop journal.*

---

## 0. What we started from

**The parent site (abbydavid.com)** already has a strong, specific voice, and the blog should sound like a wing of the same building rather than a new brand:

| Trait on abbydavid.com | What the workshop keeps |
|---|---|
| Warm paper `#f4eee1`, deep ink `#211f1c`, teal `#16605d` accent, coral `#b3401f` bookmark ribbons, gold underline | Identical tokens, light **and** the "same paper at night" dark theme |
| Newsreader (serif display), Atkinson Hyperlegible Next (body), IBM Plex Mono (metadata) | Same three families, self-hosted |
| Museum-catalogue metadata: `No. 04 · Experiment · Oct 2026 · Live`, `Fig. 1` captions | Every entry gets an accession number, figures are numbered, status is part of the catalogue line |
| A collector's locality label: "Collected in St. Louis · 38.63° N, 90.20° W" | Every entry gets **sky coordinates** from its position on the chart |
| `localStorage["abbydavid-theme"]` theme switch | Same key and switch, plus a `.abbydavid.com` cookie so the choice carries across subdomains |
| Two makers, "we" voice | Entries carry authors (Abby, David, or both) |

**Real content available today:** four catalogued projects (No. 01 AT Fitness Tracker, No. 02 Public Move, No. 03 Spirit Bomb Donations, No. 04 Ecotox ID), plus this site itself. That number matters: the homepage has to feel alive at **5 entries** and still work at **500**.

---

## 1. Three concepts

### Concept A — Project Universe (constellation graph)
Every entry is a node in a force-directed graph, clustered by theme, with edges for shared tags.

- **+** Grows naturally; return visitors see the sky fill in. Cross-links between interests show up for free.
- **+** Multi-category content fits naturally (a node can link to several clusters).
- **−** The cliché version (black starfield, glowing dots, physics jiggle) is the most common "creative portfolio" look of the last decade, so it reads as a template.
- **−** Force layouts are unstable: positions shift every time content changes, so nothing has a *place*.
- **−** Tag edges turn into a hairball past ~40 nodes. Labels collide. Poor on mobile, poor with keyboards, invisible to crawlers if it's canvas.

### Concept B — Workshop Desk (object metaphor)
A top-down illustrated workbench; the notebook, robot part, trail map, camera, blueprint, microscope and screen are doors into categories.

- **+** Instantly says "a person works here". Warm, tactile, very memorable on the first visit.
- **−** It's really a category menu with illustrations. Seven objects means seven fixed categories, and there's nowhere to put entry #200 except inside a drawer, which is a blog index again.
- **−** It only works with commissioned, high-craft illustration. Stock or AI art makes it look cheap fast, and every new interest needs a new object drawn.
- **−** Desks are wide and shallow and phones are tall and narrow: the composition either shrinks to illegible or turns into a stacked list.
- **−** The novelty is spent by the third visit, because nothing on the desk changes when you publish.

### Concept C — The Night Atlas (chosen): a hand-engraved star chart of the workshop
A synthesis: Concept A's structure, Concept B's sense of physical artifacts, and the parent site's specimen-catalogue language. It is drawn as an **antique celestial atlas** on the abbydavid.com paper, not as outer space.

- Each **field** (AI, Software, Engineering, Science…) is a **constellation**, named in italic Newsreader on the chart.
- Each **entry** is a **star** with a catalogue number. Its glyph shows its status (an idea is a dashed ring, a build in progress pulses coral, a finished project is solid, an evolving one has orbit rings) and its size shows depth.
- **Positions are deterministic and permanent.** Stars are placed by accession number on a golden-angle spiral inside their constellation, so entry No. 07 stays exactly where it is forever and new work grows outward. The chart becomes a place you can learn and return to.
- Constellation lines are a minimum spanning tree inside each field, so they look like real star figures and never a hairball. Cross-field **threads** (related entries and secondary fields) appear only for the star you're pointing at.
- **On the bench**, a strip of the things being built right now, sits under the chart. This is where Concept B's "someone works here" warmth lives.
- **The Ledger** is the full catalogue as a list, in the parent site's `.entries` style. It's the accessible, crawlable and mobile-friendly twin of the chart, not an afterthought.
- Every dossier shows its **sky coordinates** ("RA 14h 22m · Dec +31°"), echoing the "Collected in St. Louis" locality label. You can always find your way from an article back to its star.

---

## 2. Visual direction options

| | Direction | Look | Verdict |
|---|---|---|---|
| V1 | **Deep space** | Black, neon, glow, particles | Rejected: generic, ignores the parent brand, hurts readability |
| V2 | **Cyanotype blueprint** | Prussian blue, white linework, drafting grid | Strong for engineering, but wrong for trail logs and essays, and it clashes with the warm parent palette |
| V3 | **Field notebook** | Kraft paper, pencil, tape, handwriting | Warm, but turns into skeuomorphic kitsch quickly and is hard to make premium |
| **V4** | **Engraved atlas on paper (chosen)** | Parent tokens; hairline ink graticule, star glyphs, italic constellation names, mono coordinates, coral as the only "live" colour; dark theme = the same chart at night | Premium, editorial, scientific *and* warm, and seamless with abbydavid.com |

**Rules for V4**
- Ink lines are 0.75–1px; nothing glows except the coral pulse on stars that are *actively being built*.
- Exactly one moving thing on screen at rest, never more.
- Serif for anything a human named (titles, constellations); mono for anything a catalogue assigns (numbers, coordinates, dates, status).
- When there's no photograph, each entry gets a **generative specimen plate**: a seeded contour engraving unique to the entry, so nothing looks like a placeholder.

---

## 3. Wireframes

### 3.1 Home — desktop (≥ 64rem)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Abby+David  /Workshop                 Atlas  Ledger  Bench  Notes  ◐ Dark│
├──────────────────────────────────────────────────────────────────────────┤
│ No. —  A working atlas of everything we make           12 entries · 10 fields
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │  ·  ·  graticule  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  │ │
│ │      ✳ No.05            Software                   Science          │ │
│ │     ╱   ╲          ●───○                       ●──◎                  │ │
│ │  AI ○    ●                    Engineering          ╲                 │ │
│ │                 Creative         ✳──●               ○  Research      │ │
│ │   ┌──────────────┐  hover card: No. 07 · Building · Robotics         │ │
│ │   │ Fig ░ title  │  "dek…"  RA 04h 12m · Dec −12°   Open dossier →  │ │
│ │   └──────────────┘                                                  │ │
│ │  Outdoors ●──●          Writing ○        Entrepreneurship ○  ○      │ │
│ │  [Whole sky]  key: ○ idea ◌ researching ✳ building ● complete ◎ evolving│
│ └──────────────────────────────────────────────────────────────────────┘ │
│ ── On the bench ─────────────────────────────────────────────────────── │
│  ✳ The Workshop Atlas   ✳ Balancing robot   ◌ Birdsong model   → Bench  │
│ ── Recently finished ── │ ── Workshop notes ──                           │
│  No. 04 Ecotox ID ↗     │  Nov 21 · "Graticule spacing finally right"   │
│ ── The Ledger (latest 6) → full ledger ───────────────────────────────── │
│ footer: Abby + David · St. Louis · ← abbydavid.com                        │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Home — mobile (< 40rem)
```
┌──────────────────────┐
│ Abby+David /Workshop ☰│
│ A working atlas…      │
│ ┌──────────────────┐  │  chart is a pannable map (native touch scroll),
│ │ ← drag the sky → │  │  opens centred on the busiest constellation
│ │   ✳──●   ○       │  │
│ └──────────────────┘  │
│ [AI][Software][Sci]…  │  field chips: tap = glide to that constellation
│ tap star → bottom     │
│ sheet specimen card   │
│ ── On the bench ──    │  horizontally scrolling tags
│ ── Ledger ──          │  full list, first-class
└──────────────────────┘
```

### 3.3 Dossier (an article)
```
┌──────────────────────────────────────────────────────────────────────────┐
│ ← Atlas / Software                                                        │
│ No. 05 · Software · Started Nov 2026 · ✳ Building                         │
│ The Workshop Atlas                       (huge Newsreader 300, balanced)  │
│ dek in italic serif                                                       │
│ Idea ─── Researching ─── Exploring ─── ✳ Building ─── Completed           │  status instrument
│ ┌────────────────────────────── Fig. 1 hero plate ───────────────────────┐│
│ └────────────────────────────────────────────────────────────────────────┘│
│ ┌ specimen card (sticky) ┐   Body: editorial column, 38rem measure        │
│ │ Field · Also in        │   ## sections…                                 │
│ │ Authors                │   <Log> progress journal entries               │
│ │ RA/Dec · Updated       │   <Compare> before/after slider                │
│ │ Tags                   │   <Gallery>, <Video> (click-to-load)           │
│ │ Contents (scrollspy)   │   code (dual-theme), <Lesson>, <Failure>       │
│ └────────────────────────┘   <Next> "What happens next"                   │
│ ── Nearby in the atlas: mini chart of related stars ───────────────────── │
│ ← previous in Software         next in Software →                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Field (constellation) page
A zoomed chart of one constellation with its full figure and labels, a short field description, its entries in the ledger format, and neighbouring constellations at the edges as links.

### 3.5 Bench page
The author-presence page: **On the bench** (active), **Next up**, **Long-term pursuits**, **Ideas being explored**, **Recently finished**. It's edited from a single YAML file.

---

## 4. User flows

**F1 — First-time visitor from social/search to a dossier**
Search result → dossier (SEO title/description, OG image) → reads → "Nearby in the atlas" mini chart → clicks a neighbouring star → second dossier → `← Atlas` → arrives on the home chart *with that star highlighted* (`/#no-07`).

**F2 — Curious explorer from the homepage**
Home → the chart draws itself in (≤1.2s, skipped with reduced motion) → hover/focus stars → specimen card → click "Software" constellation name → the sky glides and zooms → star labels reveal → click a star → a view transition morphs the star into the dossier's catalogue glyph.

**F3 — Returning visitor checking what's new**
Home → stars added since their last visit get a small coral "new" tick (the last visit is kept in localStorage only, and only on this device) → *On the bench* shows current builds → Workshop notes.

**F4 — Keyboard / screen-reader visitor**
Skip link → "Skip the chart, go to the Ledger" link → or Tab into the chart: each constellation is a labelled group, each star a real link announcing "No. 07, Balancing robot, Building, Engineering"; arrow keys move to the nearest star in that direction; Escape resets the zoom.

**F5 — Mobile visitor**
Home → swipe the sky → tap a field chip → tap a star → bottom-sheet specimen card → "Open dossier". Or scroll straight past the chart to the Ledger.

**F6 — Cross-site**
abbydavid.com nav "Workshop" → blog home (same header geometry, same theme already applied). Blog header `Abby+David` wordmark → abbydavid.com.

---

## 5. Scored comparison

1 = poor, 5 = excellent. Weighted toward what makes visitors come back.

| Criterion (weight) | A · Universe | B · Desk | **C · Night Atlas** |
|---|---|---|---|
| Memorability (×3) | 3 | 5 | **5** |
| Scales to 500 entries (×3) | 4 | 1 | **5** |
| Return-visit value (×2) | 4 | 2 | **5** |
| Mobile (×2) | 2 | 2 | **4** |
| Accessibility & SEO (×2) | 2 | 3 | **5** |
| Fit with abbydavid.com (×2) | 2 | 3 | **5** |
| Cost to maintain (×1) | 4 | 1 | **5** |
| **Weighted total (/75)** | 44 | 37 | **73** |

**Is the Desk stronger than the Universe?** Stronger on the first visit, weaker on every visit after. The Desk's warmth is real, so the Atlas takes it in three places that don't limit scale: *On the bench*, generative specimen plates, and the catalogue voice.

---

## 6. Independent critique, and what changed

An independent reviewer (a separate agent that hadn't seen the work being made) challenged the proposal. The 73/75 score above is the author marking their own homework, so these changes come from the critique rather than the score:

| Critique | Change made |
|---|---|
| RA/Dec coordinates are "astronomy cosplay": made-up numbers that mean nothing | **Dropped.** Entries are located by their catalogue line ("No. 07 · Engineering") and a "Find it on the atlas" link to `/#no-07`. The atlas is the *look*, not the vocabulary. |
| 8 statuses but only 5 glyphs, and colour carries meaning | Eight statuses map to **six distinct shapes** (idea · surveying · on the bench · paused · complete · evolving), and status is always printed as text as well. The legend shows only statuses currently on the chart. |
| Empty sky at launch; every field looks like the same sunflower | **Empty fields aren't drawn** (they're listed as "uncharted"). Each field has its own rotation and stretch, so the figures differ, and star spacing tightens automatically as a field fills so constellations never collide. |
| Motion soup | **One pulse**: only the most recently tended build. No star-to-page morph; only a quiet cross-fade with a stable header. Draw-in runs once per session, and never with reduced motion. |
| A first-time visitor needs to get it in 3 seconds | New microcopy (below), plus the page **opens with the current build's specimen card already showing**. |
| A pannable chart inside a scrolling page is a scroll trap on phones | **Mobile uses stacked constellation strips**: each field's real figure, name, count and top entries, under a non-interactive whole-sky thumbnail. |
| Keyboard model | **One tab stop, roving tabindex**: arrows move to the nearest star in a ±45° cone, `[` `]` / PageUp PageDown jump constellations, Home/End go to first and last, Escape resets. Focus lands on `/#no-NN` if present. Stars stay real links, and there's no `role="application"`. |
| Dossier: buried links, no byline, essays don't have build stages, both "Nearby" and prev/next | Live/Open links sit in the header; bylines and "last tended" date; the status track shows only for build-type kinds; contents list only at 4+ sections; prev/next dropped in favour of related threads. |
| Generative plates will all look alike | Replaced by the **constellation plate**: the entry's own star highlighted in its figure. The same drawing becomes the per-entry share image. |
| Delights | "Since Nov 3: 2 new stars · Ecotox ID moved to Completed", a one-line return summary from localStorage; "Last tended by Abby · 2 days ago" on the bench. |

**Final home microcopy**
- Eyebrow: *The Abby + David workshop*
- H1: *Everything we make, charted as stars.*
- Sub: *Each constellation is a field. Each star is a project: the bigger it is, the deeper it goes, and the coral one is on the bench right now.* → *Read it as a list instead*

## 6b. Principles that survived
1. **Stable layout**: deterministic placement from accession numbers. A star's position is part of its identity.
2. **The chart is real SVG rendered at build time**: every star is an `<a href>` that works without JavaScript and is crawlable.
3. **The Ledger is the twin**, not a fallback, and is linked from the first focus stop.
4. **Labels by priority**: constellation names, plus bench and featured stars, are always shown; the rest appear on hover, focus or zoom.

---

## 7. Content architecture

```
src/content/
  fields.yaml        constellations: id, name, description, chart position (optional override)
  authors.yaml       abby, david
  bench.yaml         on the bench / next / long-term / ideas (author presence)
  entries/*.mdx      dossiers (the stars)
  logs/*.mdx         progress-journal posts that belong to an entry
  notes/*.md         short workshop notes
```

**Entry frontmatter**
```yaml
no: 7                       # accession number: permanent, decides chart position
title: …
dek: …                      # one-line description
kind: project               # project | experiment | research | trip | essay | demo | gallery | video
field: engineering          # primary constellation
fields: [ai]                # also appears in…
tags: [robotics, control]
status: building            # idea | researching | exploring | building | in-progress | paused | completed | evolving
started: 2026-09-01
updated: 2026-11-20
authors: [abby]
related: [birdsong-model]   # explicit threads
hero: { src, alt, width, height }   # optional; otherwise a generative plate
links: [{ label: Live, href }]      # external: the project itself
featured: false
sample: false               # placeholder content: shows a stamp and can be stripped at build
```

**Routes** (designed so future sections slot in without a redesign)
```
/                     Atlas + bench + notes + ledger excerpt
/projects/[slug]/     dossier (all entry kinds)
/fields/[field]/      constellation page
/tags/[tag]/          tag index
/ledger/              the full catalogue, filterable (field / status / kind)
/bench/               what we're building, next, long-term
/notes/ , /notes/[slug]/   workshop notes
/logs/[slug]/         progress-journal posts (also listed inside their dossier)
/rss.xml  /sitemap-index.xml  /robots.txt  /404
future: /lab/[slug] (interactive demos), /gallery/, /video/: each a new `kind`, an optional layout, and the same star on the chart
```

---

## 8. Non-functional targets
- **Performance**: static HTML, zero JS on dossiers except the optional `<Compare>`/`<Video>` islands; the chart script is under 10 KB gzipped. Fonts are subset woff2 with the display serif preloaded. Targets: LCP < 1.8s on 4G, CLS < 0.02.
- **Accessibility**: WCAG 2.2 AA; contrast pairs inherited from the parent tokens (all ≥ 4.5:1); `prefers-reduced-motion` turns off draw-in, pulse, parallax and view-transition morphs; focus is always visible; the chart has a text equivalent.
- **SEO**: canonical URLs, per-entry title/description/OG, `Article`/`CreativeWork` JSON-LD with `isPartOf` abbydavid.com, sitemap, RSS, semantic headings, real links in the chart.
- **Mobile**: designed at 375px first, touch targets ≥ 44px, a native-scroll chart, and a bottom-sheet card.
