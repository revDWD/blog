/* The theme switch, shared with abbydavid.com through the abbydavid-theme key and a .abbydavid.com cookie. */

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

