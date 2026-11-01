// Longueur des titres et descriptions SEO : avertissement au build, sans rien bloquer.
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
//
// Le back-office ne limite plus la saisie (aide indicative « 150 à 160 caractères conseillés »
// pour les descriptions, « 50 à 60 » pour les titres) : c'est ici que les dépassements se voient.
// Après le build, chaque page HTML indexable est relue (balises <title> et meta description,
// telles qu'affichées par Google) et un avertissement préfixé [seo] est écrit dans la console :
//   description de plus de 160 caractères, titre de plus de 65 caractères.
// Les pages techniques toujours hors index sont ignorées (404, /merci/, démonstrations /demo/).
// Les autres pages sont toutes contrôlées, même quand le site entier est en noindex (préproduction,
// case « Indexation » des Réglages SEO décochée) : leurs textes servent à la mise en ligne.
const SEUIL_DESCRIPTION = 160;
const SEUIL_TITRE = 65;

const decoder = (s) =>
  String(s)
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
const longueur = (s) => [...s].length;

module.exports = function (eleventyConfig) {
  eleventyConfig.on("eleventy.after", ({ results }) => {
    const alertes = [];
    (results || []).forEach((r) => {
      if (!r || !r.outputPath || !String(r.outputPath).endsWith(".html") || typeof r.content !== "string") return;
      if (/^\/(404\.html|merci\/|demo\/)/.test(String(r.url || ""))) return;
      const tete = r.content.split("</head>")[0];
      const titre = /<title>([\s\S]*?)<\/title>/i.exec(tete);
      const description = /<meta name="description" content="([^"]*)"/i.exec(tete);
      if (description) {
        const n = longueur(decoder(description[1]).trim());
        if (n > SEUIL_DESCRIPTION) alertes.push(`[seo] ${r.url} : description de ${n} caractères (${SEUIL_DESCRIPTION} au plus conseillés).`);
      }
      if (titre) {
        const n = longueur(decoder(titre[1]).trim());
        if (n > SEUIL_TITRE) alertes.push(`[seo] ${r.url} : titre de ${n} caractères (${SEUIL_TITRE} au plus conseillés).`);
      }
    });
    alertes.sort().forEach((a) => console.warn(a));
  });
};
