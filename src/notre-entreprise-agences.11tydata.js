// Page Agences : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/nos_agences.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.nos_agences.seo.meta_title,
    description: (data) => data.contenus.fr.nos_agences.seo.meta_description
  }
};
