// Collections Secteurs, Clients & Solutions, Technologies et Catégories de formation.
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
// Spécification : docs/back-office/schema-collections.md
//
// - Filtre « corpsSections » : recompose le Markdown des sections de page (champ
//   « sections » : titre, texte d'introduction, sous-parties) et le rend avec la
//   même instance Markdown qu'Eleventy. Le HTML obtenu est celui de l'ancien corps
//   de texte : le filtre « blocs » d'eleventy.config.js le met ensuite en page
//   (cartes, atouts, étapes...) exactement comme avant.
// - Filtre « gras » : **mot** devient <strong>mot</strong> dans les champs courts
//   (défis, opportunités, atouts des secteurs). À appliquer avant « accent ».
// - Filtre « ficheParSlug » : fiche d'une collection à partir de son nom de fichier
//   (relations Sveltia vers les références et les formations).
// - Contrôles de build (avertissements, sans bloquer).
//
// Fonctions réutilisées par scripts/migrer-collections.js : assemblerSections, gras.

const plein = (s) => typeof s === "string" && s.trim() !== "";

// Sections -> Markdown, dans l'ordre de la page.
// Une section sans titre n'a de sens qu'en tête (texte d'introduction).
function assemblerSections(sections) {
  const parts = [];
  (Array.isArray(sections) ? sections : []).forEach((s) => {
    if (!s || typeof s !== "object") return;
    if (plein(s.titre)) parts.push(`## ${s.titre.trim()}`);
    if (plein(s.texte)) parts.push(s.texte.trim());
    (Array.isArray(s.sous_parties) ? s.sous_parties : []).forEach((sp) => {
      if (!sp || typeof sp !== "object") return;
      if (plein(sp.titre)) parts.push(`### ${sp.titre.trim()}`);
      if (plein(sp.texte)) parts.push(sp.texte.trim());
    });
  });
  return parts.length ? parts.join("\n\n") + "\n" : "";
}

// **mot** -> <strong>mot</strong> (champs courts hors Markdown).
function gras(s) {
  return s == null ? "" : String(s).replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
}

const COLLECTIONS = {
  secteurs: "secteurs",
  pages_secteurs: "pages-secteurs",
  technologies: "technologies",
  categories: "categories",
};

function collections(eleventyConfig) {
  let md = null;
  eleventyConfig.amendLibrary("md", (lib) => { md = lib; });
  const rendre = (src) => {
    if (!md) md = require("markdown-it")({ html: true }).disable("code");
    return md.render(src);
  };

  eleventyConfig.addFilter("corpsSections", (sections) => {
    const src = assemblerSections(sections);
    return src ? rendre(src) : "";
  });
  eleventyConfig.addFilter("gras", gras);
  eleventyConfig.addFilter("ficheParSlug", (liste, slug) =>
    (plein(slug) && (liste || []).find((x) => x && x.fileSlug === slug)) || null
  );

  // Contrôles des fiches (avertissements dans la console de build).
  eleventyConfig.on("eleventy.before", () => {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const racine = path.join(__dirname, "..");
    const contenu = path.join(racine, "src", "content");
    const lire = (dossier) => {
      const d = path.join(contenu, dossier);
      if (!fs.existsSync(d)) return [];
      return fs.readdirSync(d).filter((f) => f.endsWith(".md")).map((f) => {
        try { const g = matter(fs.readFileSync(path.join(d, f), "utf8")); return { f: `${dossier}/${f}`, d: g.data || {}, corps: g.content || "" }; }
        catch (e) { return { f: `${dossier}/${f}`, d: {}, corps: "" }; }
      });
    };
    const slugs = (dossier) => new Set(
      fs.existsSync(path.join(contenu, dossier))
        ? fs.readdirSync(path.join(contenu, dossier)).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3))
        : []
    );
    const refs = slugs("references");
    const formations = slugs("formations");
    const alertes = [];
    // Images Markdown sans texte alternatif : ![](...)
    const imagesSansAlt = (s) => (String(s || "").match(/!\[\s*\]\(/g) || []).length;
    const controlerSections = (f, sections) => {
      (Array.isArray(sections) ? sections : []).forEach((s, i) => {
        if (!s) return;
        if (i > 0 && !plein(s.titre)) alertes.push(`${f} : section ${i + 1} sans titre (elle se fond dans la section précédente)`);
        (s.sous_parties || []).forEach((sp, k) => {
          if (sp && !plein(sp.titre)) alertes.push(`${f} : section ${i + 1}, sous-partie ${k + 1} sans titre`);
          if (sp && imagesSansAlt(sp.texte)) alertes.push(`${f} : section ${i + 1}, sous-partie ${k + 1} : image sans texte alternatif`);
        });
        if (imagesSansAlt(s.texte)) alertes.push(`${f} : section ${i + 1} : image sans texte alternatif`);
      });
    };
    const controlerRefs = (f, liste) => (Array.isArray(liste) ? liste : []).forEach((r) => {
      const slug = r && typeof r === "object" ? r.fiche : r;
      if (plein(slug) && !refs.has(slug)) alertes.push(`${f} : fiche référence « ${slug} » introuvable`);
    });

    for (const { f, d } of lire(COLLECTIONS.secteurs)) controlerRefs(f, d.references);
    for (const { f, d } of lire(COLLECTIONS.pages_secteurs)) {
      controlerRefs(f, d.references);
      controlerSections(f, d.sections);
    }
    for (const { f, d } of lire(COLLECTIONS.technologies)) {
      controlerRefs(f, d.references);
      controlerSections(f, d.sections);
      (d.formations || []).forEach((x, i) => {
        if (x && plein(x.formation) && !formations.has(x.formation)) alertes.push(`${f} : formation « ${x.formation} » introuvable`);
        if (x && !plein(x.formation)) alertes.push(`${f} : formation liée ${i + 1} sans fiche (lien inactif)`);
      });
    }
    for (const { f, d, corps } of lire(COLLECTIONS.categories)) {
      if (!plein(d.nom)) alertes.push(`${f} : nom de catégorie manquant`);
      if (imagesSansAlt(corps)) alertes.push(`${f} : image sans texte alternatif dans le texte de présentation`);
    }
    alertes.forEach((a) => console.warn("[collections] " + a));
  });
}

module.exports = collections;
module.exports.assemblerSections = assemblerSections;
module.exports.gras = gras;
