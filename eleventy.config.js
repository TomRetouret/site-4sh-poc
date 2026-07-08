module.exports = function (eleventyConfig) {
  // Fichiers copiés tels quels vers le site généré
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads" });

  // Rang d'affichage des niveaux de formation
  const RANG_NIVEAU = { "Essentiel": 1, "Fondamental": 2, "Intermédiaire": 3, "Avancé": 4 };
  const rang = (n) => RANG_NIVEAU[n] || 9;
  const prixNombre = (p) => parseInt(String(p || "").replace(/[^0-9]/g, ""), 10) || 0;

  // Collection des formations (une fiche = un niveau = un fichier Markdown)
  eleventyConfig.addCollection("formations", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/formations/*.md")
      .sort((a, b) => (a.data.titre || "").localeCompare(b.data.titre || ""));
  });

  // Formations regroupées par techno (une carte au catalogue, plusieurs niveaux)
  eleventyConfig.addCollection("formationsParGroupe", (collectionApi) => {
    const items = collectionApi.getFilteredByGlob("src/content/formations/*.md");
    const groupes = {};
    items.forEach((it) => {
      const g = it.data.groupe || it.fileSlug;
      (groupes[g] = groupes[g] || []).push(it);
    });
    return Object.keys(groupes)
      .map((g) => {
        const list = groupes[g].sort((a, b) => rang(a.data.niveau) - rang(b.data.niveau));
        const entree = list[0];
        const min = Math.min(...list.map((l) => prixNombre(l.data.prix)).filter((n) => n > 0));
        return {
          groupe: g,
          titre: entree.data.titre,
          categorie: entree.data.categorie,
          image: entree.data.image,
          chapo: entree.data.chapo,
          avis: entree.data.avis,
          prixMin: isFinite(min) ? min : prixNombre(entree.data.prix),
          url: entree.url,
          niveaux: list.map((l) => ({
            niveau: l.data.niveau,
            duree: l.data.duree,
            url: l.url,
            prix: l.data.prix
          }))
        };
      })
      .sort((a, b) => (a.titre || "").localeCompare(b.titre || ""));
  });

  // Références (une fiche projet = un fichier Markdown)
  eleventyConfig.addCollection("references", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/references/*.md")
      .sort((a, b) => (a.data.ordre || 99) - (b.data.ordre || 99) || (a.data.titre || "").localeCompare(b.data.titre || ""));
  });

  // Valeurs uniques pour les filtres de la page Références
  eleventyConfig.addCollection("referenceFiltres", (collectionApi) => {
    const items = collectionApi.getFilteredByGlob("src/content/references/*.md");
    const uniq = (key) => {
      const set = new Set();
      items.forEach((it) => (it.data[key] || []).forEach((v) => set.add(v)));
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    };
    const uniqStr = (key) => {
      const set = new Set();
      items.forEach((it) => { if (it.data[key]) set.add(it.data[key]); });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    };
    return { secteurs: uniq("secteurs"), technologies: uniq("technologies"), typesProjet: uniqStr("type_projet") };
  });

  // Glossaire : termes lus sur le disque (fiable même en permalink:false), groupés par lettre
  eleventyConfig.addCollection("glossaireGroupes", () => {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const dir = path.join(__dirname, "src", "content", "glossaire");
    const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    let fichiers = [];
    try { fichiers = fs.readdirSync(dir).filter((f) => f.endsWith(".md")); } catch (e) { return []; }
    const termes = fichiers
      .map((f) => {
        const g = matter(fs.readFileSync(path.join(dir, f), "utf8"));
        return { terme: g.data.terme, definition: g.data.definition };
      })
      .filter((t) => t.terme)
      .sort((a, b) => norm(a.terme).localeCompare(norm(b.terme)));
    const groupes = {};
    termes.forEach((t) => {
      const L = norm(t.terme).charAt(0);
      (groupes[L] = groupes[L] || []).push(t);
    });
    return Object.keys(groupes).sort().map((L) => ({ lettre: L, termes: groupes[L] }));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "dist"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
