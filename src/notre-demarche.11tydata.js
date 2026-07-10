module.exports = {
  eleventyComputed: {
    title: (data) => data.notre_demarche.meta_title,
    description: (data) => data.notre_demarche.meta_description
  }
};
