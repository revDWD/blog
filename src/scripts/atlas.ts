/**
 * Progressive enhancement for the home atlas. Without this file the chart is still a complete,
 * linked SVG. With it: one tab stop with roving focus, spatial arrow keys, constellation jumps,
 * a specimen card, glide-zoom into constellations, related threads, a subtle parallax, and a
 * one-line "since your last visit" summary.
 */
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const desktop = matchMedia("(min-width: 48rem)");
const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

type View = [number, number, number, number];
const parseVB = (s: string) => s.split(/[\s,]+/).map(Number) as View;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function initAtlas() {
  const stage = document.querySelector<HTMLElement>("[data-atlas]");
  if (!stage) return;
  const svg = stage.querySelector<SVGSVGElement>("svg.sky-interactive")!;
  const frameEl = stage.querySelector<HTMLElement>(".atlas-frame")!;
  const card = stage.querySelector<HTMLElement>("[data-card]")!;
  const resetBtn = stage.querySelector<HTMLButtonElement>("[data-reset]")!;
  const stars = [...svg.querySelectorAll<SVGAElement>("a.star")];
  if (!stars.length) return;
  const full = parseVB(svg.dataset.full!);
  let view: View = [...full];
  let zoomed: string | null = null;
  let hot: SVGAElement | null = null;
  let pinned = true; // the opening card for the current build

  try { sessionStorage.setItem("workshop-drawn", "1"); } catch { /* ignore */ }

  // ---------- geometry helpers ----------
  const pos = (s: SVGAElement) => ({ x: +s.dataset.x!, y: +s.dataset.y! });
  const fields = [...new Set(stars.map((s) => s.dataset.field!))];
  const byNo = [...stars].sort((a, b) => +a.dataset.no! - +b.dataset.no!);

  // ---------- roving tabindex: the chart is one tab stop ----------
  const fromHash = location.hash.match(/^#no-\d+$/) ? svg.querySelector<SVGAElement>(location.hash) : null;
  let rover = fromHash ?? stars.find((s) => s.id && s.dataset.id === stage.dataset.pulse) ?? stars[0];
  const setRover = (s: SVGAElement) => {
    for (const x of stars) x.setAttribute("tabindex", x === s ? "0" : "-1");
    rover = s;
  };
  if (desktop.matches) setRover(rover);
  svg.querySelectorAll(".c-label").forEach((l) => l.setAttribute("tabindex", "-1"));

  function nearest(from: SVGAElement, dx: number, dy: number) {
    const p = pos(from);
    let best: SVGAElement | null = null;
    let bestScore = Infinity;
    for (const s of stars) {
      if (s === from) continue;
      const q = pos(s);
      const vx = q.x - p.x, vy = q.y - p.y;
      const dist = Math.hypot(vx, vy);
      const cos = (vx * dx + vy * dy) / dist;
      if (cos < Math.SQRT1_2) continue; // within a ±45° cone
      const score = dist * (2 - cos);
      if (score < bestScore) (bestScore = score), (best = s);
    }
    return best;
  }
  function firstOf(field: string) {
    return stars.filter((s) => s.dataset.field === field).sort((a, b) => +a.dataset.no! - +b.dataset.no!)[0];
  }

  svg.addEventListener("keydown", (e) => {
    const cur = (document.activeElement as SVGAElement)?.closest?.("a.star") as SVGAElement | null;
    if (!cur) return;
    let next: SVGAElement | null = null;
    const fi = fields.indexOf(cur.dataset.field!);
    switch (e.key) {
      case "ArrowRight": next = nearest(cur, 1, 0); break;
      case "ArrowLeft": next = nearest(cur, -1, 0); break;
      case "ArrowDown": next = nearest(cur, 0, 1); break;
      case "ArrowUp": next = nearest(cur, 0, -1); break;
      case "]": case "PageDown": next = firstOf(fields[(fi + 1) % fields.length]); break;
      case "[": case "PageUp": next = firstOf(fields[(fi - 1 + fields.length) % fields.length]); break;
      case "Home": next = byNo[0]; break;
      case "End": next = byNo[byNo.length - 1]; break;
      case "Escape": e.preventDefault(); if (zoomed) zoomTo(null); else { pinned = false; heat(null); } return;
      default: return;
    }
    e.preventDefault();
    if (next) { setRover(next); next.focus(); }
  });

  // ---------- hot star: card, kin, threads ----------
  function heat(s: SVGAElement | null, fromPointer = false) {
    hot?.classList.remove("is-hot");
    svg.querySelectorAll(".is-kin").forEach((k) => k.classList.remove("is-kin"));
    svg.querySelectorAll(".thread.is-on").forEach((t) => t.classList.remove("is-on"));
    hot = s;
    svg.classList.toggle("has-hot", !!s && !pinned);
    if (!s) { card.hidden = true; return; }
    s.classList.add("is-hot");
    const id = s.dataset.id!;
    svg.querySelectorAll<SVGPathElement>(`.thread[data-a="${id}"], .thread[data-b="${id}"]`).forEach((t) => {
      t.classList.add("is-on");
      const other = t.dataset.a === id ? t.dataset.b : t.dataset.a;
      svg.querySelector(`a.star[data-id="${other}"]`)?.classList.add("is-kin");
    });
    fillCard(s);
    placeCard(s);
    if (!fromPointer) pinned = false;
  }
  function fillCard(s: SVGAElement) {
    const d = s.dataset;
    card.querySelector("[data-c-no]")!.textContent = `No. ${String(d.no).padStart(2, "0")}`;
    card.querySelector("[data-c-field]")!.textContent = d.fieldName!;
    card.querySelector("[data-c-title]")!.textContent = d.title!;
    card.querySelector("[data-c-dek]")!.textContent = d.dek!;
    const st = card.querySelector<HTMLElement>("[data-c-status]")!;
    st.textContent = d.status!;
    st.toggleAttribute("data-bench", d.glyph === "bench");
    card.dataset.href = s.getAttribute("href")!;
  }
  function placeCard(s: SVGAElement) {
    const g = s.querySelector(".g-scale") as SVGGraphicsElement;
    const r = g.getBoundingClientRect();
    const f = frameEl.getBoundingClientRect();
    card.hidden = false;
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const sx = r.left - f.left, sy = r.top - f.top;
    const clampX = (x: number) => Math.max(12, Math.min(x, f.width - cw - 12));
    const clampY = (y: number) => Math.max(12, Math.min(y, f.height - ch - 60));
    // Try right, left, below, above; keep whichever covers the fewest other stars and names.
    const candidates = [
      [sx + r.width + 18, sy + r.height / 2 - ch / 2],
      [sx - cw - 18, sy + r.height / 2 - ch / 2],
      [sx + r.width / 2 - cw / 2, sy + r.height + 22],
      [sx + r.width / 2 - cw / 2, sy - ch - 22],
      [sx + r.width + 14, sy + r.height + 8],
      [sx - cw - 14, sy + r.height + 8],
      [sx + r.width + 14, sy - ch - 8],
      [sx - cw - 14, sy - ch - 8],
      [12, 12],
      [f.width - cw - 12, 12],
    ].map(([x, y]) => [clampX(x), clampY(y)] as const);
    const far = ([x, y]: readonly [number, number]) =>
      Math.hypot(x + cw / 2 - (sx + r.width / 2), y + ch / 2 - (sy + r.height / 2)) * 1.5;
    // Constellation names and other stars are expensive to cover; star labels are cheap.
    const obstacles = [...svg.querySelectorAll(".star .g-scale, .c-name, .s-label.is-shown, .is-kin .s-label")]
      .filter((el) => !s.contains(el))
      .map((el) => ({ o: el.getBoundingClientRect(), w: el.classList.contains("s-label") ? 1 : el.classList.contains("c-name") ? 12 : 4 }));
    // Score = overlapped area with other stars, names and visible labels (in px²).
    const covers = ([x, y]: readonly [number, number]) => {
      let n = 0;
      for (const { o, w: weight } of obstacles) {
        const ox = o.left - f.left, oy = o.top - f.top;
        const w = Math.min(x + cw + 6, ox + o.width) - Math.max(x - 6, ox);
        const h = Math.min(y + ch + 6, oy + o.height) - Math.max(y - 6, oy);
        if (w > 0 && h > 0) n += (w * h + 400) * weight;
      }
      // never sit on the star itself
      if (sx + r.width > x && sx < x + cw && sy + r.height > y && sy < y + ch) n += 1e7;
      return n;
    };
    const score = (c: readonly [number, number]) => covers(c) + far(c);
    const [left, top] = candidates.reduce((best, c) => (score(c) < score(best) ? c : best));
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }
  card.addEventListener("click", () => { if (card.dataset.href) location.href = card.dataset.href; });

  for (const s of stars) {
    s.addEventListener("pointerenter", () => { pinned = false; heat(s, true); });
    s.addEventListener("focus", () => { setRover(s); heat(s); });
  }
  svg.addEventListener("pointerleave", () => { if (!svg.contains(document.activeElement)) heat(null); });
  svg.addEventListener("focusout", (e) => { if (!svg.contains(e.relatedTarget as Node)) heat(null); });
  frameEl.addEventListener("pointerleave", (e) => { if (!card.contains(e.relatedTarget as Node)) heat(null); });

  // Open with the current build's specimen card showing, so a first-time visitor sees what a star is.
  const opening = stars.find((s) => s.dataset.id === stage.dataset.pulse);
  if (opening && desktop.matches && !fromHash) {
    requestAnimationFrame(() => { pinned = true; heat(opening, true); svg.classList.remove("has-hot"); });
  }
  if (fromHash && desktop.matches) {
    requestAnimationFrame(() => { fromHash.scrollIntoView({ block: "center" }); fromHash.focus({ preventScroll: true }); });
  }

  // ---------- zoom ----------
  let raf = 0;
  function animateTo(target: View) {
    cancelAnimationFrame(raf);
    const start = [...view] as View;
    const t0 = performance.now();
    const dur = reduce.matches ? 0 : 700;
    const z = full[2] / target[2];
    svg.style.setProperty("--lz", String(1 / Math.pow(z, 0.75)));
    svg.style.setProperty("--gz", String(1 / Math.pow(z, 0.55)));
    const step = (now: number) => {
      const t = dur ? Math.min(1, (now - t0) / dur) : 1;
      const k = ease(t);
      view = start.map((v, i) => v + (target[i] - v) * k) as View;
      svg.setAttribute("viewBox", view.map((n) => n.toFixed(1)).join(" "));
      if (t < 1) raf = requestAnimationFrame(step);
      else if (hot) placeCard(hot);
    };
    raf = requestAnimationFrame(step);
  }
  function zoomTo(field: string | null) {
    zoomed = field;
    heat(null);
    svg.querySelectorAll(".constellation").forEach((c) => c.classList.toggle("is-zoomed", c.getAttribute("data-field") === field));
    stage.querySelectorAll<HTMLAnchorElement>("[data-fly]").forEach((a) => a.dataset.fly === field ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
    resetBtn.hidden = !field;
    if (!field) return animateTo(full);
    const list = stars.filter((s) => s.dataset.field === field).map(pos);
    const xs = list.map((p) => p.x), ys = list.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = Math.max(420, (maxX - minX) * 2.2 + 260);
    const h = w / (full[2] / full[3]);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2 - 10;
    animateTo([cx - w / 2, cy - h / 2, w, h]);
    const first = firstOf(field);
    if (first) setRover(first);
  }
  stage.querySelectorAll<HTMLAnchorElement>("[data-fly]").forEach((a) =>
    a.addEventListener("click", (e) => {
      if (!desktop.matches || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      zoomTo(zoomed === a.dataset.fly ? null : a.dataset.fly!);
    }),
  );
  resetBtn.addEventListener("click", () => zoomTo(null));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || svg.contains(document.activeElement)) return;
    if (zoomed) zoomTo(null);
    else { pinned = false; heat(null); }
  });

  // ---------- parallax: the graticule drifts a few units against the pointer ----------
  const grid = svg.querySelector<SVGGElement>(".layer-grid");
  if (grid && finePointer.matches && !reduce.matches) {
    let pr = 0;
    frameEl.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(pr);
      pr = requestAnimationFrame(() => {
        const f = frameEl.getBoundingClientRect();
        const nx = (e.clientX - f.left) / f.width - 0.5, ny = (e.clientY - f.top) / f.height - 0.5;
        grid.style.transform = `translate(${(-nx * 7).toFixed(2)}px, ${(-ny * 5).toFixed(2)}px)`;
      });
    });
    frameEl.addEventListener("pointerleave", () => (grid.style.transform = ""));
    grid.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
  }

  // ---------- phones: the chart is a picture, not a control ----------
  const syncInert = () => svg.toggleAttribute("inert", !desktop.matches);
  syncInert();
  desktop.addEventListener("change", syncInert);
  addEventListener("resize", () => { if (hot && desktop.matches) placeCard(hot); });

  // ---------- since your last visit ----------
  sinceLastVisit(stars);
}

function sinceLastVisit(stars: SVGAElement[]) {
  const KEY = "workshop-seen";
  const now: Record<string, string> = {};
  for (const s of stars) now[s.dataset.id!] = s.dataset.status!;
  let prev: { t: string; s: Record<string, string> } | null = null;
  try { prev = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { /* ignore */ }
  try { localStorage.setItem(KEY, JSON.stringify({ t: new Date().toISOString(), s: now })); } catch { /* ignore */ }
  if (!prev?.s) return;
  const fresh = stars.filter((s) => !(s.dataset.id! in prev!.s));
  const moved = stars.filter((s) => prev!.s[s.dataset.id!] && prev!.s[s.dataset.id!] !== s.dataset.status);
  if (!fresh.length && !moved.length) return;
  const el = document.querySelector<HTMLElement>("[data-since]");
  if (!el) return;
  const when = new Date(prev.t).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const link = (s: SVGAElement) => `<a href="${s.getAttribute("href")}">${escapeHtml(s.dataset.title!)}</a>`;
  const parts: string[] = [];
  if (fresh.length) parts.push(`${fresh.length} new ${fresh.length === 1 ? "star" : "stars"} (${fresh.slice(0, 3).map(link).join(", ")})`);
  for (const m of moved.slice(0, 2)) parts.push(`${link(m)} moved to ${escapeHtml(m.dataset.status!)}`);
  el.innerHTML = `Since ${when}: ${parts.join(" · ")}.`;
  el.hidden = false;
}
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
