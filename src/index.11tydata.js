// Titre / description SEO de l'accueil, tirés des blocs éditables (src/_data/contenus/fr/accueil.json)
module.exports = {
  altUrl: "/en/",
  eleventyComputed: {
    title: (data) => data.contenus.fr.accueil.seo.meta_title,
    description: (data) => data.contenus.fr.accueil.seo.meta_description
  }
};
