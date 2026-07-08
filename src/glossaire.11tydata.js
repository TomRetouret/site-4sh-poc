module.exports = {
  eleventyComputed: {
    title: (data) => data.page_glossaire.meta_title,
    description: (data) => data.page_glossaire.meta_description
  }
};
