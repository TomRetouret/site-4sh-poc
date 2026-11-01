// Données appliquées à toutes les fiches technologie
module.exports = {
  layout: "technologie.njk",
  extraCss: "/assets/logiciel-metier.css",
  permalink: (data) => `/expertises-techniques/${data.page.fileSlug}/`,
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.nom} - Expertise technique 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.intro,
    // base.njk et le plan du site lisent « noindex » : déduit de la case « Afficher dans les
    // moteurs de recherche » (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false,
    // Code couleur par famille d'offre : build (rouge) par défaut, run (cyan) pour l'infra
    bodyClass: (data) => (data.famille ? "famille-" + data.famille : "")
  }
};
