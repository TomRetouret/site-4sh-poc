// Pages de démonstration de la preuve de concept back-office (scénario « créer une page »).
// Jamais indexées, absentes des collections (donc du plan du site).
module.exports = {
  layout: "page-blocs.njk",
  noindex: true,
  eleventyExcludeFromCollections: true,
  permalink: (data) => `/demo/${data.page.fileSlug}/`,
  eleventyComputed: {
    title: (data) => (data.seo && data.seo.meta_title) || data.titre,
    description: (data) => (data.seo && data.seo.meta_description) || ""
  }
};
