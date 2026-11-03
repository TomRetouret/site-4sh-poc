// Page Podcasts : titre et description SEO (src/_data/page_podcasts.json, groupe Référencement).
module.exports = {
  eleventyComputed: {
    title: (data) => data.page_podcasts.seo.meta_title,
    description: (data) => data.page_podcasts.seo.meta_description,
    donnees_structurees_page: (data) => (data.page_podcasts.seo || {}).donnees_structurees
  }
};
