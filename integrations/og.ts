/**
 * Share images, made after the build in plain Node.
 *
 * Rendering them inside a page route broke on Cloudflare: its Astro adapter pre-renders routes in
 * the Workers runtime, which can't load resvg's native binary or read files. This hook runs in
 * the build process itself, reads the prerendered /atlas.json, and writes /og/<slug>.png next to it.
 */
import type { AstroIntegration } from "astro";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ogDefault, ogEntry } from "../src/lib/og";
import type { Atlas } from "../src/lib/atlas";

function findAtlas(root: string): string | null {
  const direct = join(root, "atlas.json");
  if (existsSync(direct)) return direct;
  for (const d of readdirSync(root, { withFileTypes: true })) {
    if (d.isDirectory()) {
      const hit = findAtlas(join(root, d.name));
      if (hit) return hit;
    }
  }
  return null;
}

export default function shareImages(): AstroIntegration {
  return {
    name: "workshop-share-images",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const file = findAtlas(out) ?? findAtlas(fileURLToPath(new URL("../dist/", import.meta.url)));
        if (!file) return logger.warn("atlas.json not found; share images skipped");
        const root = file.slice(0, -"atlas.json".length);
        const { atlas, kickers } = JSON.parse(readFileSync(file, "utf8")) as { atlas: Atlas; kickers: Record<string, string> };
        mkdirSync(join(root, "og"), { recursive: true });
        writeFileSync(join(root, "og", "default.png"), ogDefault(atlas));
        for (const star of atlas.stars) writeFileSync(join(root, "og", `${star.id}.png`), ogEntry(atlas, star, kickers[star.id] ?? ""));
        logger.info(`${atlas.stars.length + 1} share images written to ${join(root, "og")}`);
      },
    },
  };
}
