module.exports = {
  eleventyComputed: {
    title: (data) => data.page_references.seo.meta_title,
    description: (data) => data.page_references.seo.meta_description,
    donnees_structurees_page: (data) => (data.page_references.seo || {}).donnees_structurees
  }
};
