// Fiches références (src/content/references/*.md) : étude de cas en rubriques fixes.
// Chargé automatiquement par eleventy.config.js (dossier eleventy/).
//
// - Filtre « etudeDeCas » : recompose le Markdown de l'étude de cas à partir des
//   rubriques de la fiche (champ etude) et le rend avec la même bibliothèque
//   Markdown qu'Eleventy, pour un rendu identique à l'ancien corps de texte.
// - Filtre « dateMaj » : date ISO (ou objet Date lu dans le YAML) vers JJ/MM/AAAA.
// - Contrôles de build (avertissements, sans bloquer) : texte alternatif manquant,
//   valeur absente des Listes de référence (src/_data/listes.json).
//
// La fonction « assembler » est aussi utilisée par scripts/migrer-references.js
// (vérification de la migration) : module.exports.assembler.

// Intertitres fixes des rubriques (repris des fiches existantes).
const INTERTITRES = {
  entreprise: "Entreprise et activité",
  missions: "Nos missions",
  enjeux_objectifs: "Enjeux & Objectifs",
  enjeux: "Les enjeux",
  objectifs: "Les objectifs",
  points_cles_projet: "Les points clés du projet",
};
// Intertitres possibles de la rubrique « Points clés » (liste fermée, même liste
// que admin/config/collections/020-references.yml).
const INTERTITRES_POINTS_CLES = [
  "Les points clés de l'application",
  "Les points clés de l'application mobile",
  "Les points clés de la solution",
  "Les points clés de kubernetes",
  "Les points clés",
];

const plein = (s) => typeof s === "string" && s.trim() !== "";

// Recompose le Markdown de l'étude de cas, dans l'ordre de la page.
function assembler(etude) {
  const e = etude || {};
  const parts = [];
  const section = (titre, corps, niveau = "##") => `${niveau} ${titre}\n\n${corps.trim()}`;
  if (plein(e.entreprise)) parts.push(section(INTERTITRES.entreprise, e.entreprise));
  if (plein(e.missions)) parts.push(section(INTERTITRES.missions, e.missions));
  const eo = e.enjeux_objectifs || {};
  if (plein(eo.intro) || plein(eo.enjeux) || plein(eo.objectifs)) {
    parts.push(`## ${INTERTITRES.enjeux_objectifs}`);
    if (plein(eo.intro)) parts.push(eo.intro.trim());
    if (plein(eo.enjeux)) parts.push(section(INTERTITRES.enjeux, eo.enjeux, "###"));
    if (plein(eo.objectifs)) parts.push(section(INTERTITRES.objectifs, eo.objectifs, "###"));
  }
  const pc = e.points_cles || {};
  if (plein(pc.texte)) parts.push(section(pc.intertitre || INTERTITRES_POINTS_CLES[0], pc.texte));
  if (plein(pc.projet)) parts.push(section(INTERTITRES.points_cles_projet, pc.projet));
  if (plein(e.complements)) parts.push(e.complements.trim());
  return parts.join("\n\n") + (parts.length ? "\n" : "");
}

// JJ/MM/AAAA à partir d'une date ISO AAAA-MM-JJ ou d'un objet Date (YAML).
function dateMaj(v) {
  if (v instanceof Date && !isNaN(v)) {
    const p = (n) => String(n).padStart(2, "0");
    return `${p(v.getUTCDate())}/${p(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`;
  }
  const m = String(v == null ? "" : v).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(v == null ? "" : v);
}

function references(eleventyConfig) {
  // Même instance Markdown que celle d'Eleventy (mêmes options, mêmes extensions).
  let md = null;
  eleventyConfig.amendLibrary("md", (lib) => { md = lib; });
  const rendre = (src) => {
    if (!md) md = require("markdown-it")({ html: true }).disable("code");
    return md.render(src);
  };

  eleventyConfig.addFilter("etudeDeCas", (etude) => {
    const src = assembler(etude);
    return src ? rendre(src) : "";
  });
  eleventyConfig.addFilter("dateMaj", dateMaj);

  // Contrôles des fiches (avertissements dans la console de build).
  eleventyConfig.on("eleventy.before", () => {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const racine = path.join(__dirname, "..");
    const dossier = path.join(racine, "src", "content", "references");
    let listes = {};
    try { listes = JSON.parse(fs.readFileSync(path.join(racine, "src", "_data", "listes.json"), "utf8")); } catch (e) { return; }
    const valeurs = (k) => new Set((listes[k] || []).map((x) => x && x.nom));
    const ref = { secteurs: valeurs("secteurs"), technologies: valeurs("technologies"), expertises: valeurs("expertises") };
    const alertes = [];
    for (const f of fs.readdirSync(dossier).filter((x) => x.endsWith(".md"))) {
      let d;
      try { d = matter(fs.readFileSync(path.join(dossier, f), "utf8")).data; } catch (e) { continue; }
      for (const k of Object.keys(ref)) {
        (d[k] || []).forEach((v) => { if (!ref[k].has(v)) alertes.push(`${f} : « ${v} » absent de la liste ${k} (src/_data/listes.json)`); });
      }
      if (d.image && !d.image_decorative && !plein(d.image_alt)) alertes.push(`${f} : visuel principal sans texte alternatif`);
      (d.galerie || []).forEach((g, i) => {
        if (g && typeof g === "object" && g.image && !g.decorative && !plein(g.alt)) alertes.push(`${f} : image ${i + 1} de la galerie sans texte alternatif`);
      });
    }
    alertes.forEach((a) => console.warn("[références] " + a));
  });
}

module.exports = references;
module.exports.assembler = assembler;
module.exports.dateMaj = dateMaj;
module.exports.INTERTITRES = INTERTITRES;
module.exports.INTERTITRES_POINTS_CLES = INTERTITRES_POINTS_CLES;
