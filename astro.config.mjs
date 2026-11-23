// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

/**
 * Pages that carry `noindex` stay out of the sitemap too: sample content, and tag pages with
 * fewer than two entries (the same rule as src/pages/tags/[tag].astro).
 */
function unlisted() {
  const out = new Set(["/404/"]);
  const front = (file) => readFileSync(file, "utf8").split(/^---$/m)[1] ?? "";
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const tags = new Map();
  for (const [dir, route] of [["entries", "projects"], ["notes", "notes"], ["logs", "logs"]]) {
    for (const f of readdirSync(`src/content/${dir}`)) {
      if (f.startsWith("_") || !/\.mdx?$/.test(f)) continue;
      const fm = front(`src/content/${dir}/${f}`);
      const slug = f.replace(/\.mdx?$/, "");
      const sample = /^sample:\s*true/m.test(fm);
      if (sample) out.add(`/${route}/${slug}/`);
      if (dir === "entries" && !(sample && process.env.INCLUDE_SAMPLES === "false")) {
        const m = fm.match(/^tags:\s*\[(.*)\]/m);
        for (const t of m ? m[1].split(",").map((x) => x.trim()).filter(Boolean) : [])
          tags.set(slugify(t), (tags.get(slugify(t)) ?? 0) + 1);
      }
    }
  }
  for (const [t, n] of tags) if (n < 2) out.add(`/tags/${t}/`);
  return out;
}
const skip = unlisted();

export default defineConfig({
  site: "https://blog.abbydavid.com",
  trailingSlash: "always",
  integrations: [mdx(), sitemap({ filter: (page) => !skip.has(new URL(page).pathname) })],
  build: { inlineStylesheets: "auto", assets: "assets" },
  vite: {
    // native module: never bundle it (see src/lib/og.ts)
    ssr: { external: ["@resvg/resvg-js"] },
    optimizeDeps: { exclude: ["@resvg/resvg-js"] },
    build: {
      rollupOptions: {
        // hash-only names: no leading underscores, nothing to collide
        output: { assetFileNames: "assets/[hash][extname]", chunkFileNames: "assets/[hash].js", entryFileNames: "assets/[hash].js" },
      },
    },
  },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  markdown: {
    shikiConfig: {
      // High-contrast themes pass WCAG AA for every token colour; switched by data-theme (see global.css)
      themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
      defaultColor: false,
      wrap: false,
    },
  },
});
