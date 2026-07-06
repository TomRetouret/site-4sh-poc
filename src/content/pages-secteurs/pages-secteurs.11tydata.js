// Données appliquées aux pages Clients & Solutions (sous /secteurs/)
module.exports = {
  layout: "secteur-libre.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `${data.titre} - 4SH`,
    description: (data) => data.meta_description || data.chapo
  }
};
