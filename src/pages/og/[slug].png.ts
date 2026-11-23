import type { APIRoute, GetStaticPaths } from "astro";
import { getAtlas, getEntries, no } from "../../lib/content";
import { ogEntry, ogDefault } from "../../lib/og";

export const getStaticPaths: GetStaticPaths = async () => {
  const entries = await getEntries();
  return [{ params: { slug: "default" } }, ...entries.map((e) => ({ params: { slug: e.id } }))];
};

export const GET: APIRoute = async ({ params }) => {
  const atlas = await getAtlas();
  if (params.slug === "default") return new Response(ogDefault(atlas), { headers: { "Content-Type": "image/png" } });
  const star = atlas.stars.find((s) => s.id === params.slug)!;
  const entry = (await getEntries()).find((e) => e.id === params.slug)!;
  const kicker = `${no(star.no)} · ${star.fieldName} · ${entry.data.status === "in-progress" ? "In progress" : entry.data.status[0].toUpperCase() + entry.data.status.slice(1)}`;
  return new Response(ogEntry(atlas, star, kicker), { headers: { "Content-Type": "image/png" } });
};
