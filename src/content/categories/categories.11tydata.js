// Données appliquées à toutes les pages de catégorie
module.exports = {
  layout: "categorie.njk",
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `Formations ${data.nom} - 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.intro,
    // base.njk et le plan du site lisent « noindex » : déduit de la case « Afficher dans les
    // moteurs de recherche » (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false
  }
};
