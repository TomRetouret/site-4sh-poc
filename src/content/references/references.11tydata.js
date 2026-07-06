// Données appliquées à toutes les fiches références
module.exports = {
  layout: "reference.njk",
  eleventyComputed: {
    title: (data) => data.meta_title || `${data.titre} - Référence 4SH`,
    description: (data) => data.meta_description || data.sous_titre || data.resume,
    // Navigation projet précédent / suivant (ordre du catalogue), comme sur 4sh.fr
    voisins: (data) => {
      const all = (data.collections.references || []).slice().sort(
        (a, b) => (a.data.ordre || 99) - (b.data.ordre || 99)
      );
      const i = all.findIndex((r) => r.url === data.page.url);
      return {
        precedent: i > 0 ? all[i - 1] : null,
        suivant: i >= 0 && i < all.length - 1 ? all[i + 1] : null
      };
    }
  }
};
