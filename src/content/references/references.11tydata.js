// Données appliquées à toutes les fiches références
module.exports = {
  layout: "reference.njk",
  eleventyComputed: {
    title: (data) => (data.referencement && data.referencement.meta_title) || `${data.titre} - Référence 4SH`,
    description: (data) => (data.referencement && data.referencement.meta_description) || data.sous_titre || data.resume,
    // base.njk lit « noindex » : déduit de la case « Afficher dans les moteurs de recherche »
    // (cochée par défaut ; seule une case explicitement décochée masque la page).
    noindex: (data) => Boolean(data.noindex) || (data.referencement && data.referencement.indexation === false) || false,
    // Navigation projet précédent / suivant (ordre du catalogue), comme sur 4sh.fr
    voisins: (data) => {
      const all = (data.collections.references || []).slice().sort(
        (a, b) => (a.data.ordre || 99) - (b.data.ordre || 99)
      );
      const i = all.findIndex((r) => r.url === data.page.url);
      // Boucle comme sur 4sh.fr : la première fiche a la dernière pour précédente, et inversement.
      if (i < 0 || all.length < 2) return { precedent: null, suivant: null };
      return {
        precedent: all[(i - 1 + all.length) % all.length],
        suivant: all[(i + 1) % all.length]
      };
    }
  }
};
