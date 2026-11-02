// Page Engagements : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/engagements.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.engagements.seo.meta_title,
    description: (data) => data.contenus.fr.engagements.seo.meta_description
  }
};
