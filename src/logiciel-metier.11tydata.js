// Page d'offre Logiciel métier : titre et description SEO, couleur d'offre de la page,
// tirés des blocs éditables (src/_data/contenus/fr/logiciel_metier.json).
const FAMILLES = { build: "build", run: "run", learning: "learning" };

module.exports = {
  eleventyComputed: {
    title: (data) => data.contenus.fr.logiciel_metier.seo.meta_title,
    description: (data) => data.contenus.fr.logiciel_metier.seo.meta_description,
    // Offre choisie dans le hero sobre : donne la classe famille-<offre> du gabarit de base.
    offre: (data) => {
      const hero = (data.contenus.fr.logiciel_metier.blocs || []).find((b) => b && b.type === "hero" && !b.masquer);
      return (hero && hero.variante === "sobre" && FAMILLES[hero.offre]) || "";
    }
  }
};
