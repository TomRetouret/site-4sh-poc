// Données appliquées à toutes les pages secteur
module.exports = {
  layout: "secteur.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `${data.titre} - Logiciel métier sur mesure | 4SH`,
    description: (data) => data.meta_description || data.accroche
  }
};
