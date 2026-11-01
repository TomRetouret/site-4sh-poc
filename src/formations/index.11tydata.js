module.exports = {
  altUrl: "/en/training/",
  eleventyComputed: {
    title: (data) => data.page_formations.seo.meta_title,
    description: (data) => data.page_formations.seo.meta_description
  }
};
