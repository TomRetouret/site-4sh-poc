// Page Équipe : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/notre_equipe.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.notre_equipe.seo.meta_title,
    description: (data) => data.contenus.fr.notre_equipe.seo.meta_description,
    donnees_structurees_page: (data) => (data.contenus.fr.notre_equipe.seo || {}).donnees_structurees
  }
};
