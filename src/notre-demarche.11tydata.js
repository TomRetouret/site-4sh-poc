// Page Notre démarche : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/notre_demarche.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.notre_demarche.seo.meta_title,
    description: (data) => data.contenus.fr.notre_demarche.seo.meta_description,
    donnees_structurees_page: (data) => (data.contenus.fr.notre_demarche.seo || {}).donnees_structurees
  }
};
