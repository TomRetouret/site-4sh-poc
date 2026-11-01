// Libellés fixes des composants de blocs (src/_data/libelles.json, src/_data/en/libelles.json).
//
// Les composants de blocs sont des macros importées : elles ne voient pas les données
// globales (libelles, en.libelles). Ce filtre relit le fichier de libellés de la langue
// de la page : anglais pour une URL qui commence par /en/, français sinon.
//
//   {{ ("blocs.blog_tout" | libelle(ctx.url_page)) or "Tout le blog" }}
//
// Renvoie "" quand la clé est absente ou vide : le gabarit garde alors sa valeur de repli.
// Les fichiers sont relus à chaque build (modifications prises en compte en mode --serve).
const fs = require("fs");
const path = require("path");

const FICHIERS = {
  fr: path.join(__dirname, "..", "src", "_data", "libelles.json"),
  en: path.join(__dirname, "..", "src", "_data", "en", "libelles.json")
};
let cache = {};

const lire = (langue) => {
  if (!(langue in cache)) {
    try {
      cache[langue] = JSON.parse(fs.readFileSync(FICHIERS[langue], "utf8"));
    } catch (e) {
      cache[langue] = {};
    }
  }
  return cache[langue];
};

module.exports = function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", () => {
    cache = {};
  });
  eleventyConfig.addFilter("libelle", (cle, url) => {
    const langue = /^\/en(\/|$)/.test(String(url || "")) ? "en" : "fr";
    const valeur = String(cle || "")
      .split(".")
      .reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), lire(langue));
    return typeof valeur === "string" ? valeur : "";
  });
};
