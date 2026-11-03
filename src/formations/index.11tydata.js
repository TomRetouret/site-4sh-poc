module.exports = {
  altUrl: "/en/training/",
  eleventyComputed: {
    title: (data) => data.page_formations.seo.meta_title,
    description: (data) => data.page_formations.seo.meta_description,
    donnees_structurees_page: (data) => (data.page_formations.seo || {}).donnees_structurees
  }
};
