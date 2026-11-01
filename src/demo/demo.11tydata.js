// Pages de démonstration de la preuve de concept back-office (scénario « créer une page »).
// Jamais indexées, absentes des collections (donc du plan du site).
const FAMILLES = { build: "build", run: "run", learning: "learning" };
// Blocs dont les styles sont dans logiciel-metier.css (pages d'offre).
const STYLES_OFFRE = ["texte_simple", "etapes", "benefices", "projet_vedette", "appel_action"];
const visibles = (data) => (data.blocs || []).filter((b) => b && !b.masquer);

module.exports = {
  layout: "page-blocs.njk",
  noindex: true,
  eleventyExcludeFromCollections: true,
  permalink: (data) => `/demo/${data.page.fileSlug}/`,
  eleventyComputed: {
    title: (data) => (data.seo && data.seo.meta_title) || data.titre,
    description: (data) => (data.seo && data.seo.meta_description) || "",
    // Couleur d'offre : celle du hero sobre, s'il y en a un.
    offre: (data) => {
      const h = visibles(data).find((b) => b.type === "hero");
      return (h && h.variante === "sobre" && FAMILLES[h.offre]) || "";
    },
    // Feuille des pages d'offre, chargée seulement si un bloc en a besoin.
    extraCss: (data) =>
      visibles(data).some((b) => STYLES_OFFRE.includes(b.type) ||
        (b.type === "hero" && b.variante === "sobre") ||
        (b.type === "technologies" && b.affichage === "cartes"))
        ? "/assets/logiciel-metier.css"
        : data.extraCss
  }
};
