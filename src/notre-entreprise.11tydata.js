module.exports = {
  eleventyComputed: {
    title: (data) => data.notre_entreprise.meta_title,
    description: (data) => data.notre_entreprise.meta_description
  }
};
