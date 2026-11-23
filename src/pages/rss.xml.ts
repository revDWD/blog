import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getEntries, getLogs, getNotes, no } from "../lib/content";

export async function GET(context: APIContext) {
  const entries = (await getEntries()).filter((e) => !e.data.sample);
  const logs = (await getLogs()).filter((l) => !l.data.sample);
  const notes = (await getNotes()).filter((n) => !n.data.sample);
  const items = [
    ...entries.map((e) => ({ title: `${no(e.data.no)} · ${e.data.title}`, description: e.data.dek, link: `/projects/${e.id}/`, pubDate: e.data.updated ?? e.data.started, categories: e.data.tags })),
    ...logs.map((l) => ({ title: `Log · ${l.data.title}`, description: l.data.summary, link: `/logs/${l.id}/`, pubDate: l.data.date })),
    ...notes.map((n) => ({ title: `Note · ${n.data.title}`, description: (n.body ?? "").replace(/[*_`#>\[\]]/g, "").replace(/\(https?:[^)]*\)/g, "").trim(), link: `/notes/${n.id}/`, pubDate: n.data.date })),
  ].sort((a, b) => +b.pubDate - +a.pubDate);
  return rss({
    title: "Abby + David Workshop",
    description: "Everything we make, charted as stars: dossiers, build logs and workshop notes.",
    site: context.site!,
    items,
    customData: "<language>en-us</language>",
  });
}
