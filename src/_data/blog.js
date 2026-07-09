/* Derniers articles du blog WordPress (blog.4sh.fr), récupérés AU BUILD.
   - source : API REST WordPress (wp-json) avec _embed (image, auteur, catégories)
   - robustesse : en cas d'échec (API down, réseau), on retombe sur blog_fallback.json committé
   - curation : on garantit au moins un article Développement / Cloud & Data dans le trio,
     pour ne pas afficher un bloc 100% Design/UX sous une home qui vend le dev sur mesure. */

const API = "https://blog.4sh.fr/wp-json/wp/v2/posts?per_page=8&_embed";
const DEV_DATA = ["development", "facility", "cloud-data"]; // slugs "Développement" et "Cloud & Data"

function stripHtml(s) {
  return (s || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&#8217;|&#039;|&#39;/g, "'")
    .replace(/&#8230;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
function frDate(iso) {
  try {
    return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch (e) { return ""; }
}
function readingTime(html) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min";
}

function mapPost(p) {
  const emb = p._embedded || {};
  const media = (emb["wp:featuredmedia"] || [])[0] || {};
  let image = media.source_url || "";
  const sizes = media.media_details && media.media_details.sizes;
  if (sizes) {
    image = (sizes.medium_large || sizes.large || sizes.medium || { source_url: image }).source_url;
  }
  const allTerms = (emb["wp:term"] || []).reduce((acc, arr) => acc.concat(arr || []), []);
  const cat = allTerms.filter(function (t) { return t && t.taxonomy === "category"; })[0] || {};
  const a = (emb.author || [])[0] || {};
  const desc = stripHtml(a.description || "");
  // le "rôle" (ex : Lead UX Designer) tient sur une ligne courte ; sinon on n'affiche que le nom
  const role = desc && desc.length <= 70 && desc.indexOf(".") === -1 ? desc : "";
  const av = a.avatar_urls ? (a.avatar_urls["96"] || a.avatar_urls["48"] || a.avatar_urls["24"] || "") : "";
  return {
    titre: stripHtml(p.title && p.title.rendered),
    url: p.link,
    date: p.date,
    date_affichee: frDate(p.date),
    duree: readingTime(p.content && p.content.rendered),
    image: image,
    categorie: cat.name || "",
    categorie_slug: cat.slug || "",
    auteur: a.name ? { nom: stripHtml(a.name), role: role, avatar: av, url: a.link || "" } : null
  };
}

function curate(list) {
  const top = list.slice(0, 3);
  const hasDev = top.some(function (p) { return DEV_DATA.indexOf(p.categorie_slug) !== -1; });
  if (!hasDev) {
    const dev = list.find(function (p) { return DEV_DATA.indexOf(p.categorie_slug) !== -1; });
    if (dev && top.indexOf(dev) === -1) top[2] = dev; // remplace le 3e par le dernier dev/data
  }
  return top.slice(0, 3);
}

module.exports = async function () {
  try {
    const res = await fetch(API, { headers: { "User-Agent": "4sh-site-build" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const posts = await res.json();
    if (!Array.isArray(posts) || !posts.length) throw new Error("réponse vide");
    const mapped = posts.map(mapPost).filter(function (p) { return p.titre && p.url; });
    const sel = curate(mapped);
    if (!sel.length) throw new Error("aucune sélection");
    return sel;
  } catch (e) {
    console.warn("[blog] récupération échouée, fallback committé utilisé :", e.message);
    try { return require("./blog_fallback.json"); } catch (_) { return []; }
  }
};
