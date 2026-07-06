// Données appliquées à toutes les fiches formation.
// eleventyComputed calcule le titre/description SEO à partir des champs de la fiche.
module.exports = {
  layout: "formation.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `Formation ${data.titre} - 4SH`,
    description: (data) => data.meta_description || data.chapo
  }
};
