module.exports = {
  altUrl: "/en/tech-expertise/",
  eleventyComputed: {
    title: (data) => data.page_technologies.meta_title,
    description: (data) => data.page_technologies.meta_description
  }
};
