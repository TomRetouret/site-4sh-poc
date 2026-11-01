// Page Notre entreprise : titre et description SEO tirés des blocs éditables
// (src/_data/contenus/fr/notre_entreprise.json, groupe Référencement).
module.exports = {
  altUrl: "/en/company/",
  eleventyComputed: {
    title: (data) => data.contenus.fr.notre_entreprise.seo.meta_title,
    description: (data) => data.contenus.fr.notre_entreprise.seo.meta_description
  }
};
