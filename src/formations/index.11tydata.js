module.exports = {
  eleventyComputed: {
    title: (data) => data.page_formations.meta_title,
    description: (data) => data.page_formations.meta_description
  }
};
