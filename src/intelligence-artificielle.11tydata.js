// Titre et description SEO de la page : groupe Référencement (referencement) du front matter.
// La clé « referencement » évite de masquer la donnée globale « seo » (réglages SEO du site).
module.exports = {
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || undefined,
    description: (data) => (data.referencement && data.referencement.meta_description) || undefined
  }
};
