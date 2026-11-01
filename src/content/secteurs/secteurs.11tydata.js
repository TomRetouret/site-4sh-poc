// Données appliquées à toutes les pages secteur
module.exports = {
  layout: "secteur.njk",
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.titre} - Logiciel métier sur mesure | 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.accroche,
    // base.njk et le plan du site lisent « noindex » : déduit de la case « Afficher dans les
    // moteurs de recherche » (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false
  }
};
