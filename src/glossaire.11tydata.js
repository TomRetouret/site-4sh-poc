module.exports = {
  eleventyComputed: {
    title: (data) => data.page_glossaire.seo.meta_title,
    description: (data) => data.page_glossaire.seo.meta_description,
    donnees_structurees_page: (data) => (data.page_glossaire.seo || {}).donnees_structurees
  }
};
