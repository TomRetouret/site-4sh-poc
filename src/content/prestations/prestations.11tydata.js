// Données appliquées à toutes les pages de prestation (sous /prestations/).
// Spécification : docs/back-office/schema-prestations.md
const OFFRES = { build: "build", run: "run" };

module.exports = {
  layout: "prestation.njk",
  eleventyComputed: {
    // Couleur d'offre (liste fermée de l'en-tête) : surtitre du hero et classe famille-<offre> du body.
    offre: (data) => (data.entete && OFFRES[data.entete.offre]) || "",
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.titre} - 4SH`,
    description: (data) =>
      (data.referencement && data.referencement.meta_description) || (data.entete && data.entete.chapo),
    // base.njk et le plan du site lisent « noindex » : déduit de la case « Afficher dans les moteurs
    // de recherche » (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) =>
      Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false
  }
};
