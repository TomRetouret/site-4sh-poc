// Données appliquées à tous les guides technologie (« En savoir plus sur <techno> »)
// Pages /formations/<slug>/ (anciennes pages /learning/formations/<catégorie>/<techno>/).
// Hors collection « technologies » : elles n'ont pas de carte sur la page Expertises techniques.
module.exports = {
  layout: "guide-technologie.njk",
  extraCss: "/assets/logiciel-metier.css",
  permalink: (data) => `/formations/${data.page.fileSlug}/`,
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.nom} : en savoir plus - 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.intro,
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false,
    // Couleur 4SH Learning (violet) par défaut
    bodyClass: (data) => "famille-" + (data.famille || "formation")
  }
};
