// Pages de prestation composées de blocs (src/content/prestations/*.md).
// Spécification : docs/back-office/schema-prestations.md
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
//
// Les blocs « section_* » reproduisent à l'identique le balisage qu'émettait le filtre
// « blocs » d'eleventy.config.js (sections à fond alterné, classes sect-*). Ce qui était
// deviné par le filtre est désormais choisi par le contributeur (type de bloc, disposition) ;
// seuls le fond alterné, le temps fort sombre et le numéro de section restent calculés.
const fs = require("fs");
const path = require("path");
const MarkdownIt = require("markdown-it");

// Même moteur Markdown qu'Eleventy pour le corps des pages (html: true, code indenté désactivé).
const md = new MarkdownIt({ html: true }).disable("code");

const dossierBlocs = path.join(__dirname, "..", "src", "_includes", "composants", "blocs");
const existe = new Map();
const blocExiste = (type) => {
  if (typeof type !== "string" || !/^[a-z][a-z0-9_]*$/.test(type) || type === "aiguilleur") return false;
  if (!existe.has(type)) existe.set(type, fs.existsSync(path.join(dossierBlocs, type + ".njk")));
  return existe.get(type);
};

// Outils repris du filtre « blocs » (mêmes expressions, pour un balisage identique).
const txt = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const listes = (html) =>
  html.replace(/<ul>/g, '<ul class="sect-liste">').replace(/<ol>/g, '<ol class="sect-liste">');
const echapper = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const enLigne = (s) => (s == null || s === "" ? "" : md.renderInline(String(s)));

module.exports = function (eleventyConfig) {
  // Texte mis en forme d'une section (Markdown), listes en checklist (classe sect-liste).
  eleventyConfig.addFilter("mdSection", (s) =>
    s == null || String(s).trim() === "" ? "" : listes(md.render(String(s)))
  );
  // Titre de section, de carte ou d'étape (Markdown en ligne : gras, lien). Comme partout sur le
  // site (filtre « accent »), un mot entre *astérisques* est le mot mis en valeur : <em class="accent">,
  // rouge et droit (la charte interdit l'italique), et non un <em> en italique.
  eleventyConfig.addFilter("mdTitre", (s) => enLigne(s).replace(/<em>/g, '<em class="accent">'));
  // Échappement du filtre d'origine (guillemets compris, apostrophe laissée telle quelle).
  eleventyConfig.addFilter("echappeSection", echapper);
  // Libellé accessible d'un carrousel : le titre de la section en texte brut.
  eleventyConfig.addFilter("libelleCarrousel", (titre) => echapper(txt(enLigne(titre))) || "Éléments");
  // Nom affiché à la place du visuel d'un projet sans fiche référence : début du titre.
  eleventyConfig.addFilter("nomProjetSection", (titre) =>
    echapper(txt(enLigne(titre)).split(/[,:\u2013-]/)[0].trim())
  );
  // Vrai pour une adresse externe (ouverte dans un nouvel onglet).
  eleventyConfig.addFilter("adresseExterne", (lien) => /^https?:/.test(String(lien || "")));

  // Mise en page calculée des sections, dans l'ordre de la page (blocs masqués ignorés) :
  //   fond   : « » (blanc), « sect-bloc--creme » une section sur deux, ou « sect-bloc--sombre »
  //            pour la première section en étapes qui n'ouvre pas la page (temps fort, une fois) ;
  //   numero : 01, 02... pour chaque section titrée (petit numéro au-dessus du titre).
  // Rend un tableau parallèle aux blocs : null pour un bloc non rendu.
  eleventyConfig.addFilter("misePageSections", (blocs) => {
    let rang = 0;
    let sombre = false;
    let n = 0;
    return (Array.isArray(blocs) ? blocs : []).map((b) => {
      if (!b || b.masquer || !blocExiste(b.type)) return null;
      let fond = "";
      if (b.type === "section_etapes" && !sombre && rang > 0) {
        fond = " sect-bloc--sombre";
        sombre = true;
      } else if (rang % 2 === 1) {
        fond = " sect-bloc--creme";
      }
      rang += 1;
      const titre = b.titre != null && String(b.titre).trim() !== "";
      if (titre) n += 1;
      return { fond, numero: titre ? String(n).padStart(2, "0") : "" };
    });
  });

  // Fiches références déjà présentées dans une section Projets (blocs visibles) :
  // elles ne sont pas répétées dans les références de bas de page.
  eleventyConfig.addFilter("refsDesSections", (blocs) => {
    const vues = [];
    (Array.isArray(blocs) ? blocs : []).forEach((b) => {
      if (!b || b.masquer || b.type !== "section_projets") return;
      (b.projets || []).forEach((p) => {
        if (p && p.reference && !vues.includes(p.reference)) vues.push(p.reference);
      });
    });
    return vues;
  });
};
