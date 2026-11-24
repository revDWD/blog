# Abby + David Workshop · blog.abbydavid.com

Write-ups of the things we make: what each one is, how it works, and where it stands.
A small static site in the same design system as [abbydavid.com](https://abbydavid.com).

```
npm install
npm run dev      # http://localhost:4321
npm run build    # static site → dist/
```

**Deploy:** Cloudflare builds and publishes every push to `main`. The build command is `npm run build`, and `wrangler.jsonc` points Cloudflare at `dist/`. Astro needs **Node 22.23.4 or newer**, pinned in `.node-version`.

## Adding a project

Copy `src/content/projects/_template.mdx` to `src/content/projects/<slug>.mdx`. It appears at `/projects/<slug>/`.

```yaml
no: 5                       # catalogue number, same as on abbydavid.com
title: Project name
summary: What it is, in one sentence.
kind: Project               # Project | Experiment | Tool | Build | Guide | Trip
status: in-progress         # live | in-progress | concept | paused | archived
categories: [software]      # ids from src/lib/site.ts
started: 2026-12-01
updated: 2026-12-04         # optional
stack: [Astro, TypeScript]  # optional: technologies involved
links: [{ label: Open it, href: https://… }]
image: { src, alt, width, height, pixel }   # optional
featured: true              # optional: show on the home page
```

The write-up uses four headings: **What it is**, **Why we built it**, **How it works**, **Outcomes**. Leave out any you can't fill in yet; the page still works. These components are available without imports:

```mdx
<Figure src="/images/x.webp" alt="…" width={1600} height={900} caption="…" />
<Gallery columns={2}> <Figure …/> <Figure …/> </Gallery>
<Video youtube="VIDEO_ID" title="…" />
<Note kind="lesson">…</Note>   <Note kind="failure">…</Note>   <Note kind="next">…</Note>
```

To add a category, add it to `CATEGORIES` in `src/lib/site.ts`.
Projects with status *In progress* or *Concept* appear under **On the bench** on the home page.

## Structure

```
src/content/projects/   one file per project
src/lib/site.ts         categories, kinds, statuses
src/lib/content.ts      loading and formatting
src/pages/              /, /projects/, /projects/<slug>/, /rss.xml, 404
src/components/         Header, Footer, ProjectCard, ProjectGrid, Status, mdx/*
src/styles/global.css   tokens shared with abbydavid.com
```

The history of the site, what the Nov 2026 rollback removed and why, and the plan for future sections are in [`docs/ROLLBACK.md`](./docs/ROLLBACK.md).
