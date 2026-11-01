module.exports = {
  eleventyComputed: {
    title: (data) => data.page_references.seo.meta_title,
    description: (data) => data.page_references.seo.meta_description
  }
};
