// Données appliquées à toutes les pages de catégorie
module.exports = {
  layout: "categorie.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `Formations ${data.nom} - 4SH`,
    description: (data) => data.meta_description || data.intro
  }
};
