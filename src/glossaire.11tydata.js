module.exports = {
  eleventyComputed: {
    title: (data) => data.page_glossaire.seo.meta_title,
    description: (data) => data.page_glossaire.seo.meta_description
  }
};
