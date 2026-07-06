module.exports = {
  eleventyComputed: {
    title: (data) => data.page_references.meta_title,
    description: (data) => data.page_references.meta_description
  }
};
