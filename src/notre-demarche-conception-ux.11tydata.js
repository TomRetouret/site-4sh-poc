// Page Conception UX : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/conception_ux.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.conception_ux.seo.meta_title,
    description: (data) => data.contenus.fr.conception_ux.seo.meta_description
  }
};
