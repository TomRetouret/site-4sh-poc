// Données appliquées à toutes les fiches technologie
module.exports = {
  layout: "technologie.njk",
  extraCss: "/assets/logiciel-metier.css",
  permalink: (data) => `/expertises-techniques/${data.page.fileSlug}/`,
  eleventyComputed: {
    title: (data) => data.meta_title || `${data.nom} - Expertise technique 4SH`,
    description: (data) => data.meta_description || data.intro,
    // Code couleur par famille d'offre : build (rouge) par défaut, run (cyan) pour l'infra
    bodyClass: (data) => (data.famille ? "famille-" + data.famille : "")
  }
};
