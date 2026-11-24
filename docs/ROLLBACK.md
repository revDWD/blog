# The rollback: from star atlas to workshop (Nov 24, 2026)

The site launched on Nov 23, 2026 as an interactive star chart: projects were stars, fields were constellations, and the homepage was a map you had to learn to read. It was creative, but it got in the way of the site's one job: **showing the work**. This rollback removes it.

The last version of the star site is commit **`cc13dcb`** on `main`. To look at or recover anything: `git show cc13dcb:<path>`, or check it out with `git checkout cc13dcb`.

## What was removed, and why

| Removed | Why |
|---|---|
| **The star atlas homepage**: a build-time star chart, constellation figures, threads, glide-zoom, roving keyboard focus, hover specimen cards, pulse and draw-in animations, the "since your last visit" line | A visitor had to learn a custom interface before they could see a single project. Four projects don't need a map. It was the largest source of code, bugs and layout edge cases on the site. |
| **The star metaphor everywhere else**: star glyphs for status, "constellation" field pages, constellation plates on each project, star-themed copy | It's the same metaphor, repeated. Status is now a word with a small dot, and categories are plain categories. |
| **Sample content**: 8 placeholder projects, a sample build log, two sample notes, sample bench items | The site should only show real work. Placeholders, even labelled ones, read as filler. |
| **"The Workshop Atlas" dossier, its log and the "workshop opens" note** | They documented the removed concept. The design history lives in git (commit `cc13dcb`, file `DESIGN.md`). |
| **The Ledger, the Bench page, tag pages, field pages, the logs section, `/atlas.json`** | These were five ways to browse four projects. They're replaced by one Projects page with category filters. |
| **Notes** | There were no real notes yet. An empty section in the nav is friction. See "Adding Notes" below. |
| **Per-entry share images** (resvg renderer, bundled TTF fonts, a post-build integration) | These were the cause of every failed Cloudflare deploy, for a small benefit. Pages now use the project's own picture, or abbydavid.com's share image. |
| **Dossier extras**: a sticky "specimen card" sidebar, status progress track, generated contents list, "threads" section, before/after slider, log components, sidenotes in the margin | They added density without explaining the projects better. |
| **Page-transition effects** and relative "3 days ago" dates | Decoration. |
| **Dependencies**: `@resvg/resvg-js`, `@expo-google-fonts/*`, `@fontsource*` | Nothing uses them any more. The fonts are self-hosted in `public/fonts/`. |

**In numbers:** 69 pages became 7, about 3,350 lines of source became about 1,030, and 10 dependencies became 4. The JavaScript left is the theme switch and the project filter.

## What the site is now

- **Workshop** (`/`): a one-line introduction, **On the bench** (projects with status *In progress* or *Concept*), and **Selected projects** (those marked `featured`).
- **Projects** (`/projects/`): every project as a card, newest first, with category filters. Without JavaScript, the page simply shows everything.
- **Project pages** (`/projects/<slug>/`): what it is, status, categories, what it's built with, links, picture, then the write-up. Two related projects follow.
- **Header:** the Abby + David wordmark (to abbydavid.com), *Workshop*, *Projects*, and the shared dark-mode switch.

Every project page answers: **what is it, what's its status, what's it built with, where can I see it**. It also answers **why we built it** and **what came of it** once those are written. Those two sections are left out until there's real text for them. Each project file has a `{/* To add: … */}` comment saying what's missing.

## Remaining complexity (worth knowing about)

1. **Images are hosted on abbydavid.com.** Ecotox ID and AT Fitness Tracker use `https://abbydavid.com/assets/*.webp`. If those files move, the pictures break. Recommendation: copy them into `public/images/` here.
2. **Catalogue numbers are kept in two places.** "No. 04" appears on abbydavid.com and in each project's `no:` field. They have to be kept in step by hand.
3. **The theme switch is duplicated** across both sites (inline head script, `theme.js` there, `site.ts` here). It's small and works, but it's two copies.
4. **`wrangler.jsonc`** is only there so Cloudflare deploys the site as plain static files and doesn't add its own Astro adapter. Keep it.
5. **Some styles are written for one page only**, such as the project write-up styles in `projects/[slug].astro`. That's fine at this size; move them to `global.css` if a second template needs them.
6. **No About or Contact page.** That's deliberate: abbydavid.com removed its About section, and neither page should exist without text Abby and David write themselves.

## Recommended architecture for what comes next

Rules for growth:

- **Every addition must help someone understand a project.** If it doesn't, it doesn't ship.
- **One content type per section.** Use a content collection, a schema in `src/content.config.ts`, one list page and one detail page. Don't build a new browsing interface for a new section.
- **Real content first.** Add a section (and its nav item) only after its first real entry exists.

Likely next steps, in order:

1. **Fill in the four write-ups:** why each was built, what it's built with (`stack:`), and what came of it.
2. **Move the two images into this repo** (see Remaining complexity, item 1).
3. **Add Notes when the first note is written.** Use a `notes` collection with `title`, `date` and optional `project` (slug), plus `/notes/` and `/notes/<slug>/`. Notes about a project can be listed at the bottom of that project's page. Add "Notes" to the nav in `Header.astro` at the same time.
4. **Add an About or Contact section only with your own words.** Use a single Markdown page rendered through `Base.astro`.
5. **Demos or videos:** add them inside a project's write-up with the existing `<Figure>`, `<Gallery>` and `<Video>` components. Don't make a new section unless several projects need the same thing.
6. **More than about 12 projects:** the filters already scale. Add a status filter next to the category filter, using the same pattern.

What not to bring back: custom navigation metaphors, generated decoration, sample content, or a second way to browse the same list.
