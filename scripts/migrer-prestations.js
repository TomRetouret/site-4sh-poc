#!/usr/bin/env node
// Migration des pages de prestation (src/content/prestations/*.md) vers des pages composées de blocs.
// Spécification : docs/back-office/schema-prestations.md
//
//   node scripts/migrer-prestations.js            convertit les fichiers en place
//   node scripts/migrer-prestations.js --essai    vérifie sans rien écrire
//   node scripts/migrer-prestations.js --fichier ux-design.md   un seul fichier
//
// Pour chaque fichier encore au format ancien (corps Markdown découpé par le filtre « blocs ») :
//  1. découpe le corps en sections (H2) et en éléments (H3 ou liste), au niveau du Markdown source,
//     sans rien réécrire du texte ;
//  2. choisit le type de chaque bloc d'après le rendu actuel du filtre « blocs » (cartes, atouts,
//     étapes, projets, texte en colonnes, bandeau) : le contributeur retrouve ce qu'il voyait ;
//  3. rend les nouveaux blocs avec les composants du site et compare au rendu du filtre
//     (à l'espace près), ainsi que les références exclues du bas de page ;
//  4. n'écrit que si tout est identique, après sauvegarde de l'original dans $HOME/sauvegarde-prestations/.
// Ce qui ne se convertit pas à coup sûr est signalé et le fichier est laissé tel quel.
// Idempotent : un fichier déjà converti (champ blocs, plus de corps) est ignoré.
const fs = require("fs");
const os = require("os");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const nunjucks = require("nunjucks");
const MarkdownIt = require("markdown-it");

const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "src", "content", "prestations");
const sauvegarde = path.join(os.homedir(), "sauvegarde-prestations");
const args = process.argv.slice(2);
const ESSAI = args.includes("--essai");
const SEUL = args.includes("--fichier") ? args[args.indexOf("--fichier") + 1] : null;

// Même moteur Markdown qu'Eleventy (html: true, code indenté désactivé).
const md = new MarkdownIt({ html: true }).disable("code");

// Filtres du site : eleventy.config.js chargé avec un faux eleventyConfig qui les recueille.
const filtres = {};
require(path.join(racine, "eleventy.config.js"))(new Proxy({}, {
  get: (t, k) => (k === "addFilter" || k === "addNunjucksFilter" ? (n, f) => { filtres[n] = f; } : () => {})
}));
for (const f of ["blocs", "refsMisesEnAvant", "misePageSections", "refsDesSections", "mdSection"]) {
  if (typeof filtres[f] !== "function") { console.error(`Filtre « ${f} » introuvable.`); process.exit(1); }
}
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(racine, "src", "_includes")), { autoescape: true });
Object.entries(filtres).forEach(([n, f]) => env.addFilter(n, f));
// Même boucle que src/_includes/prestation.njk
const GABARIT_SECTIONS = `{% set mise = blocs | misePageSections %}{% for b in blocs %}{% if mise[loop.index0] %}{% import "composants/blocs/" + b.type + ".njk" as composant %}{{ composant.bloc(b, { references: references, url_page: url, fond: mise[loop.index0].fond, numero: mise[loop.index0].numero }, false) }}{% endif %}{% endfor %}`;

// Collection des références (slug, adresse, données), comme collections.references.
const dossierRefs = path.join(racine, "src", "content", "references");
const references = fs.readdirSync(dossierRefs).filter((f) => f.endsWith(".md")).map((f) => {
  const slug = f.replace(/\.md$/, "");
  return { fileSlug: slug, url: `/references/${slug}/`, data: matter(fs.readFileSync(path.join(dossierRefs, f), "utf8")).data };
});
const parSlug = Object.fromEntries(references.map((r) => [r.fileSlug, r]));

const txt = (h) => String(h || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const normal = (h) => String(h).replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
const RE_CTA = /^<a href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>$/;

// ---------------------------------------------------------------------------
// Découpe du Markdown source en blocs de premier niveau (lignes de début et de fin).
// ---------------------------------------------------------------------------
function blocsSource(source) {
  const lignes = source.split("\n");
  const jetons = md.parse(source, {});
  const blocs = [];
  for (let i = 0; i < jetons.length; i++) {
    const j = jetons[i];
    if (j.level !== 0 || !j.map || j.nesting === -1) continue;
    const b = { debut: j.map[0], fin: j.map[1], genre: "autre", jetons: [] };
    // jetons du bloc jusqu'à sa fermeture
    let k = i;
    if (j.nesting === 1) {
      let prof = 0;
      for (; k < jetons.length; k++) {
        prof += jetons[k].nesting;
        b.jetons.push(jetons[k]);
        if (prof === 0) break;
      }
    } else b.jetons.push(j);
    if (j.type === "heading_open") { b.genre = j.tag; b.enLigne = jetons[i + 1].content; }
    else if (j.type === "paragraph_open") { b.genre = "p"; b.enLigne = jetons[i + 1].content; }
    else if (j.type === "bullet_list_open") b.genre = "ul";
    else if (j.type === "ordered_list_open") b.genre = "ol";
    b.source = lignes.slice(b.debut, b.fin).join("\n");
    blocs.push(b);
    i = k;
  }
  return blocs;
}
const assembler = (blocs) => blocs.map((b) => b.source.replace(/\s+$/, "")).join("\n\n").trim();

// Paragraphe réduit à un lien : bouton de fin de section (règle extraireCta du filtre).
function bouton(b, signaler) {
  if (b.genre !== "p") return null;
  const m = md.renderInline(b.enLigne).trim().match(RE_CTA);
  if (!m || /<a[\s>]/i.test(m[3])) return null;
  if (m[2].trim()) signaler(`bouton « ${txt(m[3])} » : attributs de lien non repris (${m[2].trim()})`);
  const s = b.enLigne.trim().match(/^\[([^\]]*)\]\(([^)\s]+)\)$/);
  if (!s) { signaler(`bouton « ${txt(m[3])} » écrit autrement qu'en [texte](adresse)`); return { texte: txt(m[3]), lien: m[1] }; }
  return { texte: s[1], lien: s[2] };
}

// Éléments d'une liste à puces convertie en cartes (règle listeEnCartes du filtre).
function cartesDeListe(liste, signaler) {
  const jetons = liste.jetons;
  const cartes = [];
  for (let i = 0; i < jetons.length; i++) {
    if (jetons[i].type !== "list_item_open" || jetons[i].level !== 1) continue;
    // contenu de l'élément : un seul paragraphe attendu
    let k = i + 1, prof = 1, paras = [], autres = 0;
    for (; k < jetons.length && prof > 0; k++) {
      prof += jetons[k].nesting;
      if (jetons[k].type === "inline" && jetons[k].level === 3) paras.push(jetons[k].content);
      else if (jetons[k].nesting === 1 && jetons[k].level === 2 && jetons[k].type !== "paragraph_open") autres++;
    }
    if (paras.length !== 1 || autres) { signaler("élément de liste à plusieurs paragraphes ou imbriqué : non converti"); return null; }
    const src = paras[0];
    const html = md.renderInline(src).trim();
    let t = html.match(/^<strong>([\s\S]*?)<\/strong>\s*:?\s*([\s\S]*)$/);
    if (t) {
      const s = src.match(/^\*\*([\s\S]*?)\*\*\s*:?\s*([\s\S]*)$/);
      if (!s || md.renderInline(s[1]) !== t[1] || md.renderInline(s[2]).trim() !== t[2].trim()) {
        signaler(`carte « ${txt(html).slice(0, 40)} » : titre en gras non séparable`); return null;
      }
      cartes.push({ titre: s[1], texte: s[2].trim() });
      continue;
    }
    t = html.match(RE_CTA);
    if (t) {
      const s = src.match(/^\[([\s\S]*)\]\(([^)\s]+)\)$/);
      if (!s) { signaler(`carte lien « ${txt(html)} » non séparable`); return null; }
      cartes.push({ titre: s[1], lien: s[2] });
      continue;
    }
    cartes.push({ texte: src });
  }
  return cartes;
}

// Projet d'une section Projets (règle carteRefItem du filtre).
function projet(item, signaler) {
  const html = md.render(assembler(item.blocs));
  const m = html.match(/\/references\/([a-z0-9-]+)\//i);
  const ref = m && parSlug[m[1]] ? parSlug[m[1]] : null;
  const p = { titre: item.titre };
  if (ref) p.reference = ref.fileSlug;
  const blocs = item.blocs.map((b) => Object.assign({}, b));
  // premier paragraphe qui se termine par un lien : ce lien devient celui de la carte
  for (const b of blocs) {
    if (b.genre !== "p") continue;
    const h = md.render(b.source);
    const f = h.match(/\s*<a href="([^"]+)"([^>]*)>([^<]*)<\/a>\s*<\/p>/);
    if (!f) continue;
    if (!ref || f[1] === ref.url) {
      const s = b.source.match(/\s*\[([^\]]*)\]\(([^)\s]+)\)\s*$/);
      if (!s || md.normalizeLink(s[2]) !== f[1]) { signaler(`projet « ${item.titre} » : lien final non séparable`); return null; }
      b.source = b.source.slice(0, s.index);
      p.lien_texte = s[1];
      if (!ref || f[1] !== ref.url) p.lien = s[2];
    }
    break;
  }
  const texte = assembler(blocs.filter((b) => b.source.trim()));
  if (texte) p.texte = texte;
  return p;
}

// Type de la section d'après le rendu du filtre.
function typeRendu(h) {
  if (/class="sect-bloc[^"]*sect-bloc--ref"/.test(h)) return "ref";
  if (/class="sect-bloc[^"]*sect-bloc--cta"/.test(h)) return "bandeau";
  if (/<div class="sect-duo">/.test(h)) return "colonnes";
  if (/class="sect-ref-carte"/.test(h)) return "projets";
  if (/<div class="sect-etapes">/.test(h)) return "etapes";
  if (/<div class="sect-atouts">/.test(h)) return "atouts";
  if (/<div class="sect-defis">|car--blocs/.test(h)) return "cartes";
  return "texte";
}

function convertirSection(sec, rendu, signaler) {
  const type = typeRendu(rendu);
  const boutons = [];
  const garder = [];
  // les boutons sont pris dans toute la section (sous-titres compris), comme le filtre
  for (const b of sec.blocs) {
    const btn = bouton(b, signaler);
    if (btn) boutons.push(btn); else garder.push(b);
  }
  // découpe en introduction et éléments H3
  const intro = [];
  const items = [];
  for (const b of garder) {
    if (b.genre === "h3") items.push({ titre: b.enLigne, blocs: [] });
    else if (items.length) items[items.length - 1].blocs.push(b);
    else intro.push(b);
  }
  const bloc = {};
  const commun = () => {
    if (sec.titre) bloc.titre = sec.titre;
    return bloc;
  };
  const fin = () => { if (boutons.length) bloc.boutons = boutons; return bloc; };
  if (type === "ref") { signaler(`section « ${sec.titre} » : mise en avant d'une seule référence, non prise en charge`); return null; }
  if (type === "texte" || type === "colonnes" || type === "bandeau") {
    if (items.length) { signaler(`section « ${sec.titre} » : sous-titres dans une section de texte`); return null; }
    bloc.type = "section_texte";
    commun();
    bloc.disposition = type === "texte" ? "empile" : type;
    if (type === "bandeau" && intro.some((b) => b.genre === "ul") && /<ul>/.test(md.render(assembler(intro))) && !/<ul/.test(rendu)) {
      signaler(`section « ${sec.titre} » : liste masquée par le bandeau d'origine`); return null;
    }
    const t = assembler(intro);
    if (t) bloc.texte = t;
    return fin();
  }
  const champ = { cartes: "cartes", atouts: "atouts", etapes: "etapes", projets: "projets" }[type];
  bloc.type = "section_" + type;
  commun();
  let elements;
  let resteIntro = intro;
  if (items.length) {
    if (type === "projets") {
      elements = items.map((it) => projet(it, signaler));
      if (elements.some((e) => !e)) return null;
    } else {
      elements = items.map((it) => {
        const e = { titre: it.titre };
        const t = assembler(it.blocs);
        if (t) e.texte = t;
        return e;
      });
    }
  } else {
    if (type === "etapes" || type === "projets") { signaler(`section « ${sec.titre} » : ${type} sans sous-titres`); return null; }
    const liste = intro.find((b) => b.genre === "ul");
    if (!liste) { signaler(`section « ${sec.titre} » : cartes sans sous-titres ni liste`); return null; }
    elements = cartesDeListe(liste, signaler);
    if (!elements) return null;
    resteIntro = intro.filter((b) => b !== liste);
  }
  const t = assembler(resteIntro);
  if (t) bloc.texte = t;
  bloc[champ] = elements;
  return fin();
}

// ---------------------------------------------------------------------------
const FAMILLES = { "Concevoir & développer": "build", "Faire vivre & auditer": "run" };
const CONNUS = ["titre", "famille_label", "ordre", "h1", "chapo", "meta_title", "meta_description", "noindex",
  "cta_label", "cta_url", "fil_parent_label", "fil_parent_url", "chiffres", "references", "faq",
  "source_url", "source_confluence", "requete_cible", "slug_prevu"];

function convertir(nom) {
  const fichier = path.join(dossier, nom);
  const brut = fs.readFileSync(fichier, "utf8");
  const g = matter(brut);
  const d = g.data;
  const alertes = [];
  const signaler = (m) => alertes.push(m);
  if (Array.isArray(d.blocs) && !g.content.trim()) return { nom, etat: "déjà converti" };
  if (/\{\{|\{%/.test(g.content)) signaler("corps contenant du code Nunjucks");
  Object.keys(d).filter((k) => !CONNUS.includes(k)).forEach((k) => signaler(`champ inconnu « ${k} » (conservé tel quel)`));
  const offre = FAMILLES[d.famille_label];
  if (!offre) signaler(`famille « ${d.famille_label} » sans couleur d'offre connue`);

  // Rendu de référence : le filtre « blocs » sur le corps rendu par Markdown.
  const url = `/prestations/${nom.replace(/\.md$/, "")}/`;
  const reference = filtres.blocs(md.render(g.content), references, url);
  const refsAvant = filtres.refsMisesEnAvant(url).slice().sort();
  const rendus = reference.split(/(?=<section class="sect-bloc)/).filter((s) => s.trim());

  // Sections du source : introduction (avant le premier H2) puis une par H2.
  const sections = [];
  let courante = { titre: "", blocs: [] };
  for (const b of blocsSource(g.content)) {
    if (b.genre === "h2") { sections.push(courante); courante = { titre: b.enLigne, blocs: [] }; }
    else courante.blocs.push(b);
  }
  sections.push(courante);
  if (!txt(md.render(assembler(sections[0].blocs)))) sections.shift();
  if (sections.length !== rendus.length) {
    signaler(`${sections.length} sections dans le source, ${rendus.length} dans le rendu`);
    return { nom, etat: "non converti", alertes };
  }
  const blocs = sections.map((s, i) => convertirSection(s, rendus[i], signaler));
  if (blocs.some((b) => !b)) return { nom, etat: "non converti", alertes };

  // Vérification : rendu recomposé identique, section par section.
  const recompose = env.renderString(GABARIT_SECTIONS, { blocs, references, url });
  const nouveaux = recompose.split(/(?=<section class="sect-bloc)/).filter((s) => s.trim());
  const ecarts = [];
  rendus.forEach((r, i) => {
    if (normal(r) !== normal(nouveaux[i] || "")) ecarts.push(i);
  });
  if (nouveaux.length !== rendus.length) ecarts.push("nombre");
  const refsApres = filtres.refsDesSections(blocs).filter((s) => parSlug[s]).sort();
  if (JSON.stringify(refsApres) !== JSON.stringify(refsAvant)) signaler(`références mises en avant : ${refsAvant} / ${refsApres}`);
  if (ecarts.length) {
    ecarts.forEach((i) => {
      if (i === "nombre") return signaler("nombre de sections différent après recomposition");
      const a = normal(rendus[i]), b = normal(nouveaux[i] || "");
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      signaler(`section ${i + 1} différente :\n    avant : …${a.slice(Math.max(0, k - 60), k + 100)}\n    après : …${b.slice(Math.max(0, k - 60), k + 100)}`);
    });
  }
  if (alertes.length) return { nom, etat: "non converti", alertes, blocs };

  // Nouveau front matter, dans l'ordre du formulaire.
  const n = { titre: d.titre };
  if (d.ordre !== undefined) n.ordre = d.ordre;
  n.entete = { offre, titre_h1: d.h1 };
  if (d.chapo) n.entete.chapo = d.chapo;
  n.entete.bouton = { texte: d.cta_label || "Parlons de votre projet", lien: d.cta_url || "/contact/" };
  if (d.fil_parent_label) n.entete.parent = { texte: d.fil_parent_label, lien: d.fil_parent_url || "" };
  if (Array.isArray(d.chiffres) && d.chiffres.length) n.chiffres = d.chiffres;
  n.blocs = blocs;
  if (Array.isArray(d.references) && d.references.length) n.references = d.references;
  if (Array.isArray(d.faq) && d.faq.length) n.faq = d.faq;
  n.referencement = {};
  if (d.meta_title) n.referencement.meta_title = d.meta_title;
  if (d.meta_description) n.referencement.meta_description = d.meta_description;
  n.referencement.indexation = d.noindex !== true;
  for (const k of ["source_url", "source_confluence", "requete_cible", "slug_prevu"]) if (d[k] !== undefined) n[k] = d[k];
  Object.keys(d).filter((k) => !CONNUS.includes(k)).forEach((k) => { n[k] = d[k]; });
  const sortie = "---\n" + yaml.dump(n, { lineWidth: -1, noRefs: true, quotingType: '"' }) + "---\n";

  // Relecture du fichier produit : mêmes blocs, même rendu.
  const relu = matter(sortie).data;
  const rendu2 = env.renderString(GABARIT_SECTIONS, { blocs: relu.blocs, references, url });
  if (normal(rendu2) !== normal(recompose)) return { nom, etat: "non converti", alertes: ["relecture du YAML produit : rendu différent"] };

  if (!ESSAI) {
    fs.mkdirSync(sauvegarde, { recursive: true });
    const copie = path.join(sauvegarde, nom);
    if (!fs.existsSync(copie)) fs.writeFileSync(copie, brut);
    fs.writeFileSync(fichier, sortie);
  }
  return { nom, etat: ESSAI ? "convertible" : "converti", blocs };
}

const fichiers = fs.readdirSync(dossier).filter((f) => f.endsWith(".md") && (!SEUL || f === SEUL)).sort();
let echecs = 0;
for (const f of fichiers) {
  const r = convertir(f);
  const types = r.blocs ? r.blocs.map((b) => b.type.replace("section_", "") + (b.disposition && b.disposition !== "empile" ? "/" + b.disposition : "")).join(", ") : "";
  console.log(`${r.etat.padEnd(14)} ${f}${types ? "  [" + types + "]" : ""}`);
  (r.alertes || []).forEach((a) => console.log("   ! " + a));
  if (r.etat === "non converti") echecs++;
}
console.log(`\n${fichiers.length} fichier(s), ${echecs} non converti(s)${ESSAI ? " (essai : rien n'a été écrit)" : ""}.` +
  (ESSAI ? "" : ` Originaux : ${sauvegarde}`));
process.exit(echecs ? 1 : 0);
