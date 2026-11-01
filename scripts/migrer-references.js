#!/usr/bin/env node
// Migration des fiches références vers le formulaire structuré (Sveltia CMS).
//   node scripts/migrer-references.js            convertit les fiches en place
//   node scripts/migrer-references.js --essai    affiche le bilan sans rien écrire
//
// Idempotent : une fiche déjà convertie est relue et réécrite à l'identique.
// Sauvegarde : avant la première écriture, chaque fichier d'origine est copié dans
// $HOME/sauvegarde-references/ (jamais écrasé ensuite).
// Rien n'est deviné : une valeur non convertible est signalée, la fiche est laissée
// telle quelle ou la valeur est gardée dans un champ de repli.
//
// Conversions :
//   corps Markdown      -> etude (4 rubriques fixes, plus « Compléments » pour ce qui ne suit pas le plan)
//   maj JJ/MM/AAAA      -> maj AAAA-MM-JJ (sinon maj_repli, texte affiché tel quel)
//   galerie [adresse]   -> galerie [{ image, alt: "<titre>, visuel N", decorative: false }]
//   image               -> + image_alt (= titre, alt actuel), image_decorative: false
//   expertises          -> doublons fusionnés (FUSIONS_EXPERTISES)
//   meta_title, meta_description, noindex -> referencement { meta_title, meta_description, indexation }
//   source_url          -> gardé dans le fichier, retiré du formulaire
const fs = require("fs");
const os = require("os");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const MarkdownIt = require("markdown-it");
const { assembler, INTERTITRES, INTERTITRES_POINTS_CLES } = require("../eleventy/references.js");

const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "src", "content", "references");
const sauvegarde = path.join(os.homedir(), "sauvegarde-references");
const essai = process.argv.includes("--essai");
const md = MarkdownIt({ html: true }).disable("code"); // options d'Eleventy 3

// Doublons d'expertise évidents : forme courte -> forme « 4SH ... » (nom de l'offre).
const FUSIONS_EXPERTISES = {
  "UX": "4SH UX",
  "Data": "4SH Data",
  "Digital": "4SH Digital",
  "Facility": "4SH Facility",
  "Learning": "4SH Learning",
  "Studio": "4SH Studio",
};

// Ordre des clés dans le fichier = ordre du formulaire.
const ORDRE = ["titre", "h1", "sous_titre", "client", "logo", "stats", "fiche_pdf", "maj", "maj_repli", "etude",
  "secteurs", "technologies", "expertises", "image", "image_alt", "image_decorative", "galerie", "resume", "ordre",
  "referencement", "source_url"];

const plein = (s) => typeof s === "string" && s.trim() !== "";

// Découpe le corps en sections H2 (titre, texte).
function sectionsH2(corps) {
  const lignes = corps.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let pre = [];
  let cur = null;
  let fence = false;
  for (const l of lignes) {
    if (/^(```|~~~)/.test(l)) fence = !fence;
    const m = !fence && l.match(/^## (.+?)\s*$/);
    if (m) { cur = { titre: m[1], lignes: [] }; sections.push(cur); continue; }
    (cur ? cur.lignes : pre).push(l);
  }
  return { preambule: pre.join("\n").trim(), sections: sections.map((s) => ({ titre: s.titre, texte: s.lignes.join("\n").trim() })) };
}

// Découpe « Enjeux & Objectifs » : intro, ### Les enjeux, ### Les objectifs. null si autre forme.
function decouperEnjeux(texte) {
  const re = /^### (.+?)\s*$/gm;
  const h3 = [];
  let m;
  while ((m = re.exec(texte))) h3.push({ titre: m[1], debut: m.index, fin: m.index + m[0].length });
  const titres = h3.map((x) => x.titre);
  if (titres.join("|") !== [INTERTITRES.enjeux, INTERTITRES.objectifs].join("|")) return null;
  return {
    intro: texte.slice(0, h3[0].debut).trim(),
    enjeux: texte.slice(h3[0].fin, h3[1].debut).trim(),
    objectifs: texte.slice(h3[1].fin).trim(),
  };
}

// Corps Markdown -> rubriques. Les sections reconnues dans l'ordre du plan vont dans leur
// rubrique ; dès la première section hors plan, elle et les suivantes vont dans « Compléments ».
function decouperCorps(corps, signaler) {
  const { preambule, sections } = sectionsH2(corps);
  if (preambule) { signaler("texte avant le premier intertitre : fiche non convertie"); return null; }
  const etude = {};
  let etape = 0; // 1 entreprise, 2 missions, 3 enjeux, 4 points clés, 5 points clés du projet
  const reste = [];
  for (const s of sections) {
    if (reste.length) { reste.push(s); continue; }
    const t = s.titre;
    if (t === INTERTITRES.entreprise && etape < 1) { etude.entreprise = s.texte; etape = 1; }
    else if (t === INTERTITRES.missions && etape < 2) { etude.missions = s.texte; etape = 2; }
    else if (t === INTERTITRES.enjeux_objectifs && etape < 3 && decouperEnjeux(s.texte)) {
      const eo = decouperEnjeux(s.texte);
      etude.enjeux_objectifs = {};
      for (const k of ["intro", "enjeux", "objectifs"]) if (eo[k]) etude.enjeux_objectifs[k] = eo[k];
      etape = 3;
    } else if (INTERTITRES_POINTS_CLES.includes(t) && etape < 4) {
      etude.points_cles = { intertitre: t, texte: s.texte }; etape = 4;
    } else if (t === INTERTITRES.points_cles_projet && etape === 4) {
      etude.points_cles.projet = s.texte; etape = 5;
    } else reste.push(s);
  }
  if (reste.length) {
    etude.complements = reste.map((s) => `## ${s.titre}\n\n${s.texte}`).join("\n\n");
    signaler(`hors plan, rangé dans Compléments : ${reste.map((s) => "« " + s.titre + " »").join(", ")}`, "info");
  }
  return etude;
}

function ordonner(d) {
  const o = {};
  for (const k of ORDRE) if (d[k] !== undefined) o[k] = d[k];
  for (const k of Object.keys(d)) if (!(k in o)) o[k] = d[k];
  return o;
}

function convertir(fichier, source, signaler) {
  const g = matter(source);
  const d = Object.assign({}, g.data);
  const corps = g.content;

  // 1. Étude de cas
  if (plein(corps)) {
    if (d.etude) { signaler("corps de texte ET rubriques présents : fiche non convertie"); return null; }
    const etude = decouperCorps(corps, signaler);
    if (!etude) return null;
    if (md.render(assembler(etude)) !== md.render(corps)) { signaler("le découpage ne redonne pas le même rendu : fiche non convertie"); return null; }
    d.etude = etude;
  }

  // 2. Date de mise à jour
  if (d.maj instanceof Date) d.maj = d.maj.toISOString().slice(0, 10);
  if (d.maj !== undefined && d.maj !== null && d.maj !== "") {
    const s = String(d.maj);
    const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const iso = `${m[3]}-${m[2]}-${m[1]}`;
      const dt = new Date(iso + "T00:00:00Z");
      if (!isNaN(dt) && dt.toISOString().slice(0, 10) === iso) d.maj = iso;
      else { d.maj_repli = s; delete d.maj; signaler(`date « ${s} » invalide : gardée dans maj_repli`); }
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      d.maj_repli = s; delete d.maj; signaler(`date « ${s} » non convertible : gardée dans maj_repli`);
    }
  }

  // 3. Visuel et galerie : textes alternatifs repris de ceux générés aujourd'hui
  if (d.image && d.image_alt === undefined) d.image_alt = String(d.titre || "");
  if (d.image && d.image_decorative === undefined) d.image_decorative = false;
  if (Array.isArray(d.galerie)) {
    d.galerie = d.galerie.map((it, i) =>
      typeof it === "string" ? { image: it, alt: `${d.titre}, visuel ${i + 1}`, decorative: false } : it);
  }

  // 4. Expertises : fusion des doublons, ordre conservé
  if (Array.isArray(d.expertises)) {
    const vues = new Set();
    d.expertises = d.expertises.map((e) => FUSIONS_EXPERTISES[e] || e).filter((e) => (vues.has(e) ? false : vues.add(e)));
  }

  // 5. Référencement (groupe séparé) ; noindex inversé en indexation
  if (d.meta_title !== undefined || d.meta_description !== undefined || d.noindex !== undefined || !d.referencement) {
    const r = Object.assign({}, d.referencement || {});
    if (d.meta_title !== undefined) r.meta_title = d.meta_title;
    if (d.meta_description !== undefined) r.meta_description = d.meta_description;
    if (d.noindex !== undefined) r.indexation = !d.noindex;
    if (r.indexation === undefined) r.indexation = true;
    delete d.meta_title; delete d.meta_description; delete d.noindex;
    d.referencement = { meta_title: r.meta_title, meta_description: r.meta_description, indexation: r.indexation };
    for (const k of Object.keys(d.referencement)) if (d.referencement[k] === undefined) delete d.referencement[k];
  }

  const front = yaml.dump(ordonner(d), { lineWidth: -1, noRefs: true, quotingType: '"' });
  return `---\n${front}---\n`;
}

const bilan = { convertis: [], inchanges: [], refuses: [], alertes: [] };
for (const f of fs.readdirSync(dossier).filter((x) => x.endsWith(".md")).sort()) {
  const chemin = path.join(dossier, f);
  const source = fs.readFileSync(chemin, "utf8");
  let refus = false;
  const signaler = (msg, niveau) => {
    bilan.alertes.push(`${f} : ${msg}`);
    if (niveau !== "info" && /non convertie/.test(msg)) refus = true;
  };
  const sortie = convertir(f, source, signaler);
  if (!sortie || refus) { bilan.refuses.push(f); continue; }
  if (sortie === source) { bilan.inchanges.push(f); continue; }
  if (!essai) {
    fs.mkdirSync(sauvegarde, { recursive: true });
    const copie = path.join(sauvegarde, f);
    if (!fs.existsSync(copie)) fs.writeFileSync(copie, source);
    fs.writeFileSync(chemin, sortie);
  }
  bilan.convertis.push(f);
}

console.log(`${essai ? "[essai] " : ""}Fiches converties : ${bilan.convertis.length}${bilan.convertis.length ? " (" + bilan.convertis.join(", ") + ")" : ""}`);
console.log(`Fiches déjà à jour : ${bilan.inchanges.length}`);
console.log(`Fiches non converties : ${bilan.refuses.length}${bilan.refuses.length ? " (" + bilan.refuses.join(", ") + ")" : ""}`);
bilan.alertes.forEach((a) => console.log("  - " + a));
if (!essai && bilan.convertis.length) console.log(`Sauvegarde des originaux : ${sauvegarde}`);
process.exitCode = bilan.refuses.length ? 1 : 0;
