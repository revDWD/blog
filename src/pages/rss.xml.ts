import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getProjects, no } from "../lib/content";

export async function GET(context: APIContext) {
  const items = [
    ...(await getProjects()).map((p) => ({
      title: `${no(p.data.no)} · ${p.data.title}`,
      description: p.data.summary,
      link: `/projects/${p.id}/`,
      pubDate: p.data.updated ?? p.data.started,
    })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({
    title: "Abby + David Workshop",
    description: "Write-ups of the things we make.",
    site: context.site!,
    items,
    customData: "<language>en-us</language>",
  });
}
