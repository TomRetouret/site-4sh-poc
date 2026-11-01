// Données appliquées aux pages Clients & Solutions (sous /secteurs/)
module.exports = {
  layout: "secteur-libre.njk",
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.titre} - 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.chapo,
    // base.njk et le plan du site lisent « noindex » : déduit de la case « Afficher dans les
    // moteurs de recherche » (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false
  }
};
