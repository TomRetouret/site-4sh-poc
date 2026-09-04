// Données appliquées à toutes les pages de prestation (sous /prestations/)
module.exports = {
  layout: "prestation.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `${data.titre} - 4SH`,
    description: (data) => data.meta_description || data.chapo
  }
};
