import type { APIRoute } from "astro";
import { getAtlas, getEntries, no, STATUS_LABEL } from "../lib/content";

/**
 * The whole chart as data: stars, constellations, threads. Share images are drawn from it
 * after the build (see integrations/og.ts), and it's a handy public feed of the atlas too.
 */
export const GET: APIRoute = async () => {
  const atlas = await getAtlas();
  const entries = await getEntries();
  const kickers = Object.fromEntries(
    entries.map((e) => {
      const s = atlas.stars.find((x) => x.id === e.id)!;
      return [e.id, `${no(s.no)} · ${s.fieldName} · ${STATUS_LABEL[e.data.status]}`];
    }),
  );
  return new Response(JSON.stringify({ atlas, kickers }), { headers: { "Content-Type": "application/json" } });
};
