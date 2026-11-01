// Outils des pages Fondations : mise en page des planches (dans le cadre de la story,
// avec les feuilles du site chargées) et calculs faits sur les valeurs réellement
// appliquées (variables CSS et styles calculés), pas sur des valeurs recopiées.

// Mise en page des planches. Angles vifs et aucune ombre, comme la charte.
export const STYLE_PLANCHE = `
<style>
.sb4{padding:40px var(--marge) 56px;background:#fff;color:var(--texte);font-family:var(--corps)}
.sb4 h2.sb4-t{font-family:var(--titre);font-weight:800;font-size:28px;line-height:1.15;letter-spacing:-.02em;color:var(--encre);margin:40px 0 8px}
.sb4 h2.sb4-t:first-child{margin-top:0}
.sb4 p.sb4-note{color:var(--texte-2);font-size:15px;max-width:820px;margin:0 0 16px}
.sb4 code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.86em;background:var(--fond-doux);padding:1px 4px}
.sb4 table.sb4-tab{width:100%;border-collapse:collapse;font-size:14.5px;margin:8px 0 24px}
.sb4 .sb4-tab th{font-family:var(--titre);font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);text-align:left;border-bottom:2px solid var(--encre);padding:8px 12px 8px 0}
.sb4 .sb4-tab td{border-bottom:1px solid var(--bordure);padding:10px 12px 10px 0;vertical-align:top}
.sb4 .sb4-ok{font-family:var(--titre);font-weight:700;color:var(--encre)}
.sb4 .sb4-ko{font-family:var(--titre);font-weight:700;color:var(--rouge)}
.sb4 .sb4-grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;margin:8px 0 24px}
.sb4 .sb4-source{margin-top:40px;padding-top:16px;border-top:1px solid var(--bordure);font-size:13.5px;color:var(--muted)}
</style>`;

/** Crée un élément à partir de HTML (la story renvoie un nœud pour pouvoir le compléter). */
export function planche(html) {
  const div = document.createElement("div");
  div.className = "sb4";
  div.innerHTML = STYLE_PLANCHE + html;
  return div;
}

/** Exécute f quand le nœud est dans la page, puis à nouveau quand les feuilles du site
 *  et les polices sont chargées (le décorateur ajoute les feuilles au moment du rendu). */
export function apresAffichage(f) {
  requestAnimationFrame(() => {
    f();
    document.head.querySelectorAll("link[rel=stylesheet]").forEach((l) => l.addEventListener("load", f, { once: true }));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(f);
    [300, 1200, 3000].forEach((t) => setTimeout(f, t));
  });
}

// ---------------------------------------------------------------------------
// Contraste (WCAG 2.x)
// ---------------------------------------------------------------------------
export function rvb(couleur) {
  const c = String(couleur).trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c);
  if (m) return m[1].split("").map((x) => parseInt(x + x, 16));
  m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = /rgba?\(([^)]+)\)/i.exec(c);
  if (m) return m[1].split(/[ ,/]+/).slice(0, 3).map(Number);
  return null;
}
function luminance([r, g, b]) {
  const l = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
export function contraste(a, b) {
  const ra = rvb(a);
  const rb = rvb(b);
  if (!ra || !rb) return null;
  const [l1, l2] = [luminance(ra), luminance(rb)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** « 6,40:1 AA » ou « 4,31:1 AA grands textes » ou « 2,1:1 insuffisant ». */
export function verdict(ratio) {
  if (ratio == null) return "";
  const v = ratio.toFixed(2).replace(".", ",") + ":1";
  if (ratio >= 7) return `${v} <span class="sb4-ok">AAA</span>`;
  if (ratio >= 4.5) return `${v} <span class="sb4-ok">AA</span>`;
  if (ratio >= 3) return `${v} <span class="sb4-ko">AA grands textes et pictos seulement</span>`;
  return `${v} <span class="sb4-ko">insuffisant</span>`;
}

/** Valeur calculée d'une variable CSS sur :root. */
export function jeton(nom) {
  return getComputedStyle(document.documentElement).getPropertyValue(nom).trim();
}

export function source(html) {
  return `<p class="sb4-source">Source : ${html}</p>`;
}

/** Texte avec `code` entre accents graves, échappé (les balises citées restent du texte). */
export const code = (s) =>
  String(s).replace(/`([^`]+)`/g, (_, c) => "<code>" + c.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</code>");
