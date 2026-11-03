// Données communes à toutes les pages anglaises (src/en/).
// lang: "en" déclenche le "chrome" anglais dans base.njk (nav, footer, seo, hreflang, switcher).
// title/description sont tirés :
//   - du groupe Référencement (seo) des contenus en blocs désignés par `contenusKey` en front matter
//     (src/_data/contenus/en/<contenusKey>.json), par exemple la page Company ;
//   - sinon du bundle de données EN désigné par `dataKey` en front matter (src/_data/en/<dataKey>.json).
const seoDe = (data) => {
  if (data.contenusKey && data.contenus && data.contenus.en && data.contenus.en[data.contenusKey]) {
    return data.contenus.en[data.contenusKey].seo || {};
  }
  if (data.dataKey && data.en[data.dataKey]) {
    const d = data.en[data.dataKey];
    return d.seo || { meta_title: d.meta_title, meta_description: d.meta_description };
  }
  return null;
};
module.exports = {
  lang: "en",
  eleventyComputed: {
    title: (data) => (seoDe(data) ? seoDe(data).meta_title : data.title),
    description: (data) => (seoDe(data) ? seoDe(data).meta_description : data.description),
    donnees_structurees_page: (data) => (seoDe(data) || {}).donnees_structurees
  }
};
