// Bibliothèque des blocs : outils de l'aiguilleur (src/_includes/composants/blocs/aiguilleur.njk).
// Mode d'emploi « Ajouter un bloc » : docs/back-office/schema-blocs.md.
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
const fs = require("fs");
const path = require("path");

const dossier = path.join(__dirname, "..", "src", "_includes", "composants", "blocs");
// Fichiers du dossier qui ne sont pas des blocs.
const RESERVES = ["aiguilleur"];
const existe = new Map();

// Fiches de la collection Équipe (src/_data/equipe/<slug>.json), lues ici car les macros
// importées n'ont pas accès aux données globales de la page.
const dossierEquipe = path.join(__dirname, "..", "src", "_data", "equipe");
const fiches = new Map();
function fiche(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9][a-z0-9_-]*$/i.test(slug)) return null;
  if (!fiches.has(slug)) {
    let f = null;
    try { f = JSON.parse(fs.readFileSync(path.join(dossierEquipe, slug + ".json"), "utf8")); } catch (e) { f = null; }
    fiches.set(slug, f);
  }
  return fiches.get(slug);
}

// Formats de document reconnus (bloc telechargement), d'après l'extension du fichier.
const FORMATS = ["pdf", "doc", "docx", "odt", "xls", "xlsx", "ods", "csv", "ppt", "pptx", "odp", "zip", "txt"];

module.exports = function (eleventyConfig) {
  // Vrai si le type de bloc a son composant src/_includes/composants/blocs/<type>.njk.
  // Un type inconnu (faute de frappe, bloc retiré) est ignoré sans casser la page.
  eleventyConfig.addFilter("blocExiste", (type) => {
    if (typeof type !== "string" || !/^[a-z][a-z0-9_]*$/.test(type) || RESERVES.includes(type)) return false;
    if (!existe.has(type)) existe.set(type, fs.existsSync(path.join(dossier, type + ".njk")));
    return existe.get(type);
  });
  // Fiches Équipe dans l'ordre des slugs choisis ; les slugs introuvables sont ignorés.
  // Chaque fiche reçoit aussi « paragraphes » (présentation découpée aux lignes vides).
  eleventyConfig.addFilter("fichesEquipe", (slugs) =>
    (Array.isArray(slugs) ? slugs : [slugs])
      .map((slug) => {
        const f = fiche(slug);
        if (!f) return null;
        const paragraphes = String(f.presentation || "").replace(/\r/g, "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
        return Object.assign({ slug, paragraphes }, f);
      })
      .filter(Boolean)
  );

  // Format affiché d'un document (« PDF »), d'après l'extension de son adresse ; vide si inconnu.
  eleventyConfig.addFilter("formatFichier", (adresse) => {
    const m = /\.([a-z0-9]+)(?:[?#].*)?$/i.exec(String(adresse || ""));
    return m && FORMATS.includes(m[1].toLowerCase()) ? m[1].toUpperCase() : "";
  });

  // En mode développement, un composant ajouté ou retiré est pris en compte au prochain rendu.
  eleventyConfig.on("eleventy.before", () => { existe.clear(); fiches.clear(); });
};
