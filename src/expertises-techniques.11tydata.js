module.exports = {
  altUrl: "/en/tech-expertise/",
  eleventyComputed: {
    title: (data) => data.page_technologies.seo.meta_title,
    description: (data) => data.page_technologies.seo.meta_description
  }
};
