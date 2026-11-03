module.exports = {
  eleventyComputed: {
    title: (data) => data.contact.seo.meta_title,
    description: (data) => data.contact.seo.meta_description,
    donnees_structurees_page: (data) => (data.contact.seo || {}).donnees_structurees
  }
};
