# AGENTS.md

Context for AI agents working on blog.abbydavid.com (the Abby + David workshop).

- Static Astro site, deployed by Cloudflare on every push to `main` (`wrangler.jsonc`, Node from `.node-version`). No server code, no adapter.
- Purpose: show real projects clearly. Before adding anything, ask: *does this help a visitor understand the work?* If not, don't add it.
- **Real content only.** No placeholder, sample or demo projects, no invented facts about Abby, David or their projects. If a fact isn't known (why something was built, its tech stack), leave the section out and add a `{/* To add: … */}` comment.
- No custom navigation metaphors, visualizations or decorative generated content. These were removed in Nov 2026; see `docs/ROLLBACK.md` (last version: commit `cc13dcb`).
- Design matches abbydavid.com: same tokens and fonts (Newsreader, Atkinson Hyperlegible Next, IBM Plex Mono), fine rules, "No. NN" catalogue lines, "Fig. N" captions, no shadows. The theme key `abbydavid-theme` and the `.abbydavid.com` cookie are shared with the main site.
- Projects live in `src/content/projects/`; vocabulary (categories, kinds, statuses) in `src/lib/site.ts`. Catalogue numbers must match abbydavid.com.
- Add a new section (and its nav item) only after its first real entry exists. Follow the plan in `docs/ROLLBACK.md`.
- Check before pushing: `npm run build` with no warnings, and pages at 375px and 1440px in light and dark.
