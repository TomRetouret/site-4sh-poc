// Données communes à toutes les pages anglaises (src/en/).
// lang: "en" déclenche le "chrome" anglais dans base.njk (nav, footer, seo, hreflang, switcher).
// title/description sont tirés du bundle de données EN désigné par `dataKey` en front matter.
module.exports = {
  lang: "en",
  eleventyComputed: {
    title: (data) => (data.dataKey && data.en[data.dataKey] ? data.en[data.dataKey].meta_title : data.title),
    description: (data) => (data.dataKey && data.en[data.dataKey] ? data.en[data.dataKey].meta_description : data.description)
  }
};
