/* Site-wide behaviour: the theme switch (shared with abbydavid.com) and relative "last tended" times. */

const KEY = "abbydavid-theme";
const COLORS = { light: "#f4eee1", dark: "#181512" } as const;
type Theme = keyof typeof COLORS;
const root = document.documentElement;
const mq = matchMedia("(prefers-color-scheme: dark)");

function saved(): Theme | null {
  try {
    const c = document.cookie.match(/(?:^|; )abbydavid-theme=(light|dark)/);
    const t = c ? c[1] : localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}
function remember(t: Theme) {
  try { localStorage.setItem(KEY, t); } catch { /* private mode: lasts this visit */ }
  // On the live domain, share the choice with abbydavid.com and its other subdomains.
  if (location.hostname.endsWith("abbydavid.com")) {
    document.cookie = `${KEY}=${t}; Domain=.abbydavid.com; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  }
}
function apply(t: Theme) {
  root.setAttribute("data-theme", t);
  root.style.colorScheme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COLORS[t]);
  const btn = document.querySelector<HTMLButtonElement>(".theme-toggle");
  if (btn) {
    btn.setAttribute("aria-checked", String(t === "dark"));
    const s = btn.querySelector(".state");
    if (s) s.textContent = t === "dark" ? "On" : "Off";
  }
}
const current = (): Theme => (root.getAttribute("data-theme") === "dark" ? "dark" : "light");

const btn = document.querySelector<HTMLButtonElement>(".theme-toggle");
if (btn) {
  btn.hidden = false;
  btn.addEventListener("click", () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    apply(next);
    remember(next);
  });
}
mq.addEventListener?.("change", (e) => { if (!saved()) apply(e.matches ? "dark" : "light"); });
addEventListener("pageshow", () => apply(saved() || (mq.matches ? "dark" : "light")));
apply(saved() || (mq.matches ? "dark" : "light"));

/* Relative times: <time data-relative datetime="…">Nov 20</time> becomes "3 days ago". */
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
for (const el of document.querySelectorAll<HTMLTimeElement>("time[data-relative]")) {
  const m = el.dateTime.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) continue;
  const then = new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((then - today.getTime()) / 86_400_000);
  if (days > 0 || days < -45) continue; // older than ~6 weeks: the date reads better
  el.title = el.textContent ?? "";
  el.textContent = days === 0 ? "today" : rtf.format(days, "day");
}
