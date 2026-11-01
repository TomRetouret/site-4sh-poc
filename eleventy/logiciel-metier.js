// Filtres des pages composées de blocs (page Logiciel métier et futures pages d'offre).
// Spécification : docs/back-office/schema-blocs.md et docs/back-office/schema-logiciel-metier.md
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
const MarkdownIt = require("markdown-it");

// Markdown limité des champs « texte mis en forme » : paragraphes, gras, liens, listes.
// Tout le reste (titres, images, citations, HTML brut...) est désactivé : le texte reste
// affiché tel quel. L'italique (*mot*) suit la convention du site : mot en rouge.
const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
md.disable([
  "heading", "lheading", "code", "fence", "blockquote", "hr", "table", "reference",
  "html_block", "html_inline", "image", "strikethrough", "backticks", "autolink"
]);

// Libellé du surtitre d'offre du hero sobre (liste fermée hero.offre).
const OFFRES = {
  build: { etiquette: "4SH Build", famille: "Concevoir & développer" },
  run: { etiquette: "4SH Run", famille: "Faire vivre & auditer" },
  learning: { etiquette: "4SH Learning", famille: "" },
  institutionnel: { etiquette: "4SH", famille: "" }
};

// Blocs rendus comme une section blanche ordinaire (fond de page).
const blocBlanc = (b) =>
  ["texte_simple", "etapes", "benefices", "projet_vedette", "logos_clients", "faq"].includes(b.type) ||
  (b.type === "technologies" && b.affichage !== "cartes");
// Blocs qui perdent leur marge haute quand ils suivent une section blanche.
const blocSerrable = (b) =>
  ["texte_simple", "etapes", "benefices", "projet_vedette", "logos_clients"].includes(b.type);

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("texteRiche", (s) =>
    s == null || s === "" ? "" : md.render(String(s)).replace(/<em>/g, '<em class="accent">')
  );

  // Surtitre d'offre : « 4SH Build · Concevoir & développer ». Vide si pas d'offre.
  eleventyConfig.addFilter("surtitreOffre", (offre) => {
    const o = OFFRES[offre];
    if (!o) return "";
    return o.famille ? `${o.etiquette} · ${o.famille}` : o.etiquette;
  });
  // Fiche référence (collection references) à partir de son slug.
  eleventyConfig.addFilter("ficheReference", (refs, slug) =>
    slug ? (refs || []).find((r) => r && r.fileSlug === slug) || null : null
  );

  // Fiches références dans l'ordre des slugs choisis ; les slugs introuvables sont ignorés.
  eleventyConfig.addFilter("fichesReferences", (refs, slugs) =>
    (Array.isArray(slugs) ? slugs : [])
      .map((slug) => (refs || []).find((r) => r && r.fileSlug === slug))
      .filter(Boolean)
  );

  // Pour chaque bloc, vrai s'il suit directement une section blanche (blocs masqués ignorés) :
  // le gabarit retire alors sa marge haute, comme sur la page d'origine.
  eleventyConfig.addFilter("blocsSerres", (blocs) => {
    let precedent = null;
    return (blocs || []).map((b) => {
      if (!b || b.masquer) return false;
      const serre = !!(precedent && blocBlanc(precedent) && blocSerrable(b));
      precedent = b;
      return serre;
    });
  });

  // Numéro d'étape calculé selon la position : 01, 02...
  eleventyConfig.addFilter("deuxChiffres", (n) => String(n).padStart(2, "0"));
  // Classe de grille des étapes selon leur nombre (cinq existait déjà).
  eleventyConfig.addFilter("classeEtapes", (n) =>
    ({ 3: "trois", 4: "quatre", 5: "cinq", 6: "six" })[n] || ""
  );
};
