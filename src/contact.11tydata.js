module.exports = {
  eleventyComputed: {
    title: (data) => data.contact.meta_title,
    description: (data) => data.contact.meta_description
  }
};
