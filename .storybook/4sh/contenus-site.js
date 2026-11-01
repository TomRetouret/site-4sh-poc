// Contenus Markdown du site pour les stories de blocs (fichiers lus tels quels, jamais recopiés).
//
// Le plugin Vite n'embarque que src/_data/**/*.json. Les blocs des pages de prestation
// (src/content/prestations/*.md), de la page de démonstration (src/demo/essai-blocs.md) et
// les fiches de la collection references (src/content/references/*.md) vivent dans l'en-tête
// YAML de fichiers Markdown : ils sont lus ici par Vite (import.meta.glob) et analysés avec
// js-yaml, comme le fait Eleventy (gray-matter).
//
//   blocDe(page, type, rang)            n-ième bloc d'un type dans src/_data/contenus/<langue>/<page>.json
//   blocDemo(type, rang)                n-ième bloc d'un type dans src/demo/essai-blocs.md
//   sectionPrestation(slug, type, rang) bloc section_* d'une page de prestation, avec le fond et
//                                       le numéro calculés par le filtre du site (misePageSections)
//   referencesSite()                    fiches references au format d'une collection Eleventy
import { load } from "js-yaml";
import { env, donnee } from "./nunjucks-navigateur.js";

const brut = (fichiers) =>
  Object.fromEntries(
    Object.entries(fichiers).map(([chemin, texte]) => [chemin.split("/").pop().replace(/\.md$/, ""), texte])
  );
const PRESTATIONS = brut(import.meta.glob("../../src/content/prestations/*.md", { query: "?raw", import: "default", eager: true }));
const REFERENCES = brut(import.meta.glob("../../src/content/references/*.md", { query: "?raw", import: "default", eager: true }));
const DEMO = brut(import.meta.glob("../../src/demo/essai-blocs.md", { query: "?raw", import: "default", eager: true }));

// En-tête YAML d'un fichier Markdown (entre les deux lignes ---).
function enTete(texte) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texte || "");
  return m ? load(m[1]) || {} : {};
}

const copie = (x) => JSON.parse(JSON.stringify(x));

// Champs d'un bloc sans type ni case « Masquer » (comme blocExemple).
function champs(b) {
  const { masquer, type, ...reste } = copie(b);
  return reste;
}

function nieme(blocs, type, rang, source) {
  const trouves = (blocs || []).filter((b) => b && b.type === type);
  if (!trouves[rang]) throw new Error(`Pas de bloc ${type} n° ${rang + 1} dans ${source}`);
  return trouves[rang];
}

export function blocDe(page, type, rang = 0, langue = "fr") {
  const contenu = donnee(`contenus/${langue}/${page}`) || {};
  return champs(nieme(contenu.blocs, type, rang, `src/_data/contenus/${langue}/${page}.json`));
}

export function blocDemo(type, rang = 0) {
  return champs(nieme(enTete(DEMO["essai-blocs"]).blocs, type, rang, "src/demo/essai-blocs.md"));
}

// Page de prestation : en-tête YAML complet (titre, entete.offre, blocs...).
export function prestation(slug) {
  if (!(slug in PRESTATIONS)) throw new Error(`Pas de page src/content/prestations/${slug}.md`);
  return enTete(PRESTATIONS[slug]);
}

// Bloc section_* d'une page de prestation, prêt pour rendreBloc :
//   { args, bloc: { contexte: { fond, numero, references, url_page }, famille } }
export function sectionPrestation(slug, type, rang = 0) {
  const page = prestation(slug);
  const blocs = page.blocs || [];
  const b = nieme(blocs, type, rang, `src/content/prestations/${slug}.md`);
  const mise = env.getFilter("misePageSections")(blocs)[blocs.indexOf(b)] || { fond: "", numero: "" };
  const offre = page.entete && page.entete.offre;
  return {
    args: champs(b),
    bloc: {
      famille: offre === "build" || offre === "run" ? offre : undefined,
      urlPage: `/prestations/${slug}/`,
      contexte: { fond: mise.fond, numero: mise.numero, references: referencesSite() }
    }
  };
}

let references;
// Collection references comme Eleventy la fournit aux gabarits : { fileSlug, url, data }.
export function referencesSite() {
  if (!references) {
    references = Object.entries(REFERENCES).map(([slug, texte]) => ({
      fileSlug: slug,
      url: `/references/${slug}/`,
      data: enTete(texte)
    }));
  }
  return references;
}

// Paramètres de story selon le type de page d'où viennent les données : feuille propre à la page
// (extraCss du gabarit) et options de rendu passées par la page à l'aiguilleur.
//   accueil : aucune feuille ; offre et institutionnel : logiciel-metier.css et gabarit « offre » ;
//   demo : logiciel-metier.css (src/demo/demo.11tydata.js) ; prestation : secteurs.css.
export const PAGES = {
  accueil: {},
  offre: { feuilles: ["/assets/logiciel-metier.css"], bloc: { gabarit: "offre" } },
  institutionnel: { feuilles: ["/assets/logiciel-metier.css"], bloc: { gabarit: "offre" } },
  demo: { feuilles: ["/assets/logiciel-metier.css"] },
  prestation: { feuilles: ["/assets/secteurs.css"] }
};
