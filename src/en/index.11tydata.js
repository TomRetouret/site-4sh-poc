// Titre / description SEO de l'accueil anglais, tirés des blocs éditables (src/_data/contenus/en/accueil.json)
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.en.accueil.seo.meta_title,
    description: (data) => data.contenus.en.accueil.seo.meta_description
  }
};
