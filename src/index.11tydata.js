// Titre / description SEO de l'accueil, tirés des données éditables (src/_data/accueil.json)
module.exports = {
  eleventyComputed: {
    title: (data) => data.accueil.meta_title,
    description: (data) => data.accueil.meta_description
  }
};
