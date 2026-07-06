module.exports = {
  eleventyComputed: {
    title: (data) => data.logiciel_metier.meta_title,
    description: (data) => data.logiciel_metier.meta_description
  }
};
