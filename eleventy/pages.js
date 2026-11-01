// Filtres des pages institutionnelles (Notre démarche, Notre entreprise, Company) et des pages uniques.
// Spécification : docs/back-office/schema-pages.md
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).

// Échappe un texte pour le HTML (&, <, >, ") en gardant l'apostrophe telle quelle,
// comme les textes écrits en dur dans les gabarits (fil d'Ariane).
const echapper = (s) =>
  String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("texteHtml", echapper);

  // Compteur animé d'un chiffre (script.js lit data-compte et data-suffixe) :
  // « 96% » donne { compte: "96", suffixe: "%" } ; « 2007 » donne { compte: "2007", suffixe: "" }.
  // Rien (pas d'animation) si le chiffre ne commence pas par un nombre entier suivi de texte sans chiffre.
  eleventyConfig.addFilter("compteurChiffre", (valeur) => {
    const m = /^(\d+)(\D*)$/.exec(String(valeur == null ? "" : valeur).trim());
    return m ? { compte: m[1], suffixe: m[2] } : null;
  });

};
