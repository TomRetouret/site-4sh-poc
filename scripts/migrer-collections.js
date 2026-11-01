#!/usr/bin/env node
// Migration des collections Secteurs, Clients & Solutions, Technologies et
// Catégories de formation vers les formulaires restructurés (Sveltia CMS).
//   node scripts/migrer-collections.js            convertit les fiches en place
//   node scripts/migrer-collections.js --essai    affiche le bilan sans rien écrire
//
// Idempotent : une fiche déjà convertie est relue et réécrite à l'identique.
// Sauvegarde : avant la première écriture, chaque fichier d'origine est copié dans
// $HOME/sauvegarde-collections/<dossier>/ (jamais écrasé ensuite).
// Contrôle avant écriture : le rendu de chaque valeur convertie est comparé à
// celui de l'ancienne valeur ; en cas d'écart, la fiche n'est pas écrite et
// l'écart est signalé. Rien n'est deviné : une valeur non convertible est signalée.
//
// Conversions :
//   meta_title, meta_description, noindex -> referencement { meta_title, meta_description, indexation }
//   <strong>mot</strong>                    -> **mot** (défis, opportunités, atouts, sections)
//   corps Markdown (Clients & Solutions, Technologies) -> sections [{ titre, texte, sous_parties [{ titre, texte }] }]
//   technologies.references[].lien "/references/<slug>/" -> fiche: <slug> (relation)
//   technologies.formations[].url "/formations/<slug>/"  -> formation: <slug> (relation)
//   cta_titre, cta_texte (Clients & Solutions) : jamais affichés, retirés du formulaire, gardés s'ils existent
//   chapo (Clients & Solutions) <strong>mot</strong> -> **mot** : écart volontaire, les balises s'affichaient en clair
//   Catégories : corps Markdown gardé (texte éditorial en prose), champs réordonnés
const fs = require("fs");
const os = require("os");
const path = require("path");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const MarkdownIt = require("markdown-it");
const { assemblerSections, gras } = require("../eleventy/collections.js");

const racine = path.join(__dirname, "..");
const contenu = path.join(racine, "src", "content");
const sauvegarde = path.join(os.homedir(), "sauvegarde-collections");
const essai = process.argv.includes("--essai");
const md = MarkdownIt({ html: true }).disable("code"); // options d'Eleventy 3

const plein = (s) => typeof s === "string" && s.trim() !== "";
const existe = (dossier, slug) => fs.existsSync(path.join(contenu, dossier, slug + ".md"));

// Ordre des clés dans le fichier = ordre du formulaire (= ordre de la page).
const ORDRES = {
  secteurs: ["titre", "h1", "accroche", "defis_intro", "defis", "opportunites_intro", "opportunites", "pourquoi",
    "comment_intro", "etapes", "references", "ordre", "referencement"],
  "pages-secteurs": ["titre", "categorie", "h1", "chapo", "logo", "cta_label", "cta_url", "sections", "chiffres",
    "references", "faq", "ordre", "referencement", "source_url", "cta_titre", "cta_texte"],
  technologies: ["nom", "famille", "logo", "h1", "intro", "pourquoi_eyebrow", "pourquoi_titre", "pourquoi_intro", "atouts",
    "references", "corps_eyebrow", "corps_titre", "corps_sombre", "sections", "formations", "faq_titre", "faq",
    "accroche_courte", "ordre", "referencement", "requete_cible", "source_url", "source_confluence", "guide_source_url"],
  categories: ["nom", "h1", "intro", "faq", "referencement"],
};

// <strong>mot</strong> -> **mot** (seulement si le contenu ne porte ni * ni balise).
const versEtoiles = (s) => String(s).replace(/<strong>([^<*\n]+?)<\/strong>/g, "**$1**");
// Champ court : conversion gardée seulement si le filtre « gras » rend la valeur d'origine.
function convertirCourt(s, signaler) {
  if (typeof s !== "string" || !s.includes("<strong>")) return s;
  const c = versEtoiles(s);
  if (gras(c) === s) return c;
  signaler(`gras non converti (rendu différent) : « ${s.slice(0, 60)}... »`);
  return s;
}

// Corps Markdown -> sections (H2) et sous-parties (H3).
function decouperCorps(corps) {
  const sections = [];
  let cur = null;
  let cible = null; // objet qui reçoit le texte courant
  let fence = false;
  const nouvelleSection = (titre) => { cur = { titre, texte: [], sous_parties: [] }; sections.push(cur); cible = cur; };
  for (const l of corps.replace(/\r\n/g, "\n").split("\n")) {
    if (/^(```|~~~)/.test(l)) fence = !fence;
    const h2 = !fence && l.match(/^## (.+?)\s*$/);
    const h3 = !fence && l.match(/^### (.+?)\s*$/);
    if (h2) { nouvelleSection(h2[1]); continue; }
    if (h3) {
      if (!cur) nouvelleSection("");
      const sp = { titre: h3[1], texte: [] };
      cur.sous_parties.push(sp);
      cible = sp;
      continue;
    }
    if (!cur) nouvelleSection("");
    cible.texte.push(l);
  }
  const net = (t) => t.join("\n").trim();
  return sections
    .map((s) => {
      const o = {};
      if (plein(s.titre)) o.titre = s.titre;
      if (plein(net(s.texte))) o.texte = net(s.texte);
      const sps = s.sous_parties.map((sp) => {
        const x = { titre: sp.titre };
        if (plein(net(sp.texte))) x.texte = net(sp.texte);
        return x;
      });
      if (sps.length) o.sous_parties = sps;
      return o;
    })
    .filter((o) => Object.keys(o).length);
}

const etoilesSections = (sections) => sections.map((s) => {
  const o = Object.assign({}, s);
  if (o.texte) o.texte = versEtoiles(o.texte);
  if (o.sous_parties) o.sous_parties = o.sous_parties.map((sp) => Object.assign({}, sp, sp.texte ? { texte: versEtoiles(sp.texte) } : {}));
  return o;
});

function ordonner(d, ordre) {
  const o = {};
  ordre.forEach((k) => { if (d[k] !== undefined) o[k] = d[k]; });
  Object.keys(d).forEach((k) => { if (!(k in o)) o[k] = d[k]; });
  return o;
}

function referencement(d) {
  const r = Object.assign({}, d.referencement || {});
  if (d.meta_title !== undefined && r.meta_title === undefined) r.meta_title = d.meta_title;
  if (d.meta_description !== undefined && r.meta_description === undefined) r.meta_description = d.meta_description;
  if (r.indexation === undefined) r.indexation = d.noindex !== true;
  delete d.meta_title; delete d.meta_description; delete d.noindex;
  const o = {};
  ["meta_title", "meta_description", "indexation"].forEach((k) => { if (r[k] !== undefined) o[k] = r[k]; });
  return o;
}

function convertir(dossier, f, source) {
  const notes = [];
  const bloquants = [];
  const g = matter(source, {});
  const d = JSON.parse(JSON.stringify(g.data));
  let corps = g.content;

  d.referencement = referencement(d);

  if (dossier === "secteurs") {
    const s = (v) => convertirCourt(v, (m) => notes.push(m));
    if (Array.isArray(d.defis)) d.defis = d.defis.map(s);
    if (Array.isArray(d.opportunites)) d.opportunites = d.opportunites.map(s);
    if (Array.isArray(d.pourquoi)) d.pourquoi = d.pourquoi.map((a) => Object.assign({}, a, Array.isArray(a.paras) ? { paras: a.paras.map(s) } : {}));
  }

  // Écart volontaire : l'accroche des pages Clients & Solutions affichait les balises
  // <strong> en clair (texte échappé). Elle passe au gras **mot** (filtre « gras »).
  if (dossier === "pages-secteurs" && typeof d.chapo === "string" && d.chapo.includes("<strong>")) {
    d.chapo = versEtoiles(d.chapo);
    notes.push("accroche : balises <strong> affichées en clair, remplacées par **...** (écart volontaire, rendu en gras)");
  }

  if (dossier === "pages-secteurs" || dossier === "technologies") {
    if (plein(corps)) {
      if (Array.isArray(d.sections) && d.sections.length) bloquants.push("corps de texte ET sections remplis : à fusionner à la main");
      else {
        const attendu = md.render(corps);
        let sections = etoilesSections(decouperCorps(corps));
        if (md.render(assemblerSections(sections)) !== attendu) {
          sections = decouperCorps(corps); // sans conversion du gras
          if (md.render(assemblerSections(sections)) !== attendu) bloquants.push("découpage en sections : rendu différent, fiche laissée telle quelle");
          else notes.push("gras laissé en <strong> (conversion en **...** non identique)");
        }
        if (!bloquants.length) { d.sections = sections; corps = ""; }
      }
    }
  }

  if (dossier === "technologies") {
    if (Array.isArray(d.references)) d.references = d.references.map((r, i) => {
      if (!r || typeof r !== "object" || r.fiche !== undefined || r.lien === undefined) return r;
      const o = {};
      const m = String(r.lien || "").match(/^\/references\/([a-z0-9-]+)\/$/);
      if (m && existe("references", m[1])) o.fiche = m[1];
      else if (plein(r.lien)) { bloquants.push(`référence ${i + 1} : lien « ${r.lien} » sans fiche correspondante`); return r; }
      o.titre = r.titre; o.texte = r.texte;
      Object.keys(r).forEach((k) => { if (!["lien", "titre", "texte"].includes(k)) o[k] = r[k]; });
      return o;
    });
    if (Array.isArray(d.formations)) d.formations = d.formations.map((x, i) => {
      if (!x || typeof x !== "object" || x.formation !== undefined || x.url === undefined) return x;
      const m = String(x.url || "").match(/^\/formations\/([a-z0-9-]+)\/$/);
      if (!m || !existe("formations", m[1])) { bloquants.push(`formation ${i + 1} : lien « ${x.url} » sans fiche correspondante`); return x; }
      const o = { titre: x.titre, formation: m[1] };
      Object.keys(x).forEach((k) => { if (!["url", "titre"].includes(k)) o[k] = x[k]; });
      return o;
    });
  }

  const ordre = ORDRES[dossier];
  const inconnues = Object.keys(d).filter((k) => !ordre.includes(k));
  if (inconnues.length) notes.push("clés hors formulaire gardées : " + inconnues.join(", "));
  const front = yaml.dump(ordonner(d, ordre), { lineWidth: -1, noRefs: true, quotingType: '"' });
  return { sortie: `---\n${front}---\n${corps}`, notes, bloquants };
}

// Vérifie que la fiche convertie rend comme l'originale (valeurs lues par les gabarits).
function controler(dossier, avant, apres) {
  const a = matter(avant, {}), b = matter(apres, {});
  const ecarts = [];
  const corpsA = dossier === "categories" ? md.render(a.content) : md.render(plein(a.content) ? a.content : assemblerSections(a.data.sections));
  const corpsB = dossier === "categories" ? md.render(b.content) : md.render(plein(b.content) ? b.content : assemblerSections(b.data.sections));
  if (corpsA !== corpsB) ecarts.push("corps");
  const ra = a.data.referencement || {}, rb = b.data.referencement || {};
  if ((a.data.meta_title ?? ra.meta_title) !== rb.meta_title) ecarts.push("meta_title");
  if ((a.data.meta_description ?? ra.meta_description) !== rb.meta_description) ecarts.push("meta_description");
  const noA = a.data.noindex === true || ra.indexation === false, noB = b.data.noindex === true || rb.indexation === false;
  if (noA !== noB) ecarts.push("indexation");
  if (dossier === "secteurs") {
    const g = (v) => JSON.stringify([(v.defis || []).map(gras), (v.opportunites || []).map(gras), (v.pourquoi || []).map((p) => [p.titre, (p.paras || []).map(gras)])]);
    if (g(a.data) !== g(b.data)) ecarts.push("défis, opportunités ou atouts");
  }
  if (dossier === "technologies") {
    const r = (v) => JSON.stringify((v.references || []).map((x) => [x.titre, x.texte, x.fiche ? `/references/${x.fiche}/` : (x.lien || "")]));
    const fo = (v) => JSON.stringify((v.formations || []).map((x) => [x.titre, x.formation ? `/formations/${x.formation}/` : (x.url || "")]));
    if (r(a.data) !== r(b.data)) ecarts.push("références");
    if (fo(a.data) !== fo(b.data)) ecarts.push("formations");
  }
  // Toutes les autres clés : identiques
  if (dossier === "pages-secteurs" && versEtoiles(a.data.chapo || "") !== (b.data.chapo || "")) ecarts.push("chapo");
  const ignorer = new Set(["chapo", "meta_title", "meta_description", "noindex", "referencement", "sections", "defis", "opportunites", "pourquoi", "references", "formations"]);
  new Set([...Object.keys(a.data), ...Object.keys(b.data)]).forEach((k) => {
    if (ignorer.has(k)) return;
    if (JSON.stringify(a.data[k]) !== JSON.stringify(b.data[k])) ecarts.push(k);
  });
  if (dossier !== "technologies" && JSON.stringify(a.data.references) !== JSON.stringify(b.data.references)) ecarts.push("references");
  return ecarts;
}

let ecrits = 0, inchanges = 0, refuses = 0;
for (const dossier of Object.keys(ORDRES)) {
  const dir = path.join(contenu, dossier);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md")).sort()) {
    const chemin = path.join(dir, f);
    const source = fs.readFileSync(chemin, "utf8");
    const { sortie, notes, bloquants } = convertir(dossier, f, source);
    const ecarts = bloquants.length ? [] : controler(dossier, source, sortie);
    const nom = `${dossier}/${f}`;
    notes.forEach((n) => console.log(`  ${nom} : ${n}`));
    if (bloquants.length || ecarts.length) {
      refuses++;
      bloquants.forEach((b) => console.log(`  NON CONVERTIBLE ${nom} : ${b}`));
      if (ecarts.length) console.log(`  REFUSÉ ${nom} : rendu différent (${ecarts.join(", ")})`);
      continue;
    }
    if (sortie === source) { inchanges++; continue; }
    ecrits++;
    if (essai) { console.log(`  à convertir : ${nom}`); continue; }
    const copie = path.join(sauvegarde, dossier, f);
    fs.mkdirSync(path.dirname(copie), { recursive: true });
    if (!fs.existsSync(copie)) fs.writeFileSync(copie, source);
    fs.writeFileSync(chemin, sortie);
  }
}
console.log(`${essai ? "[essai] " : ""}${ecrits} fiche(s) ${essai ? "à convertir" : "convertie(s)"}, ${inchanges} déjà à jour, ${refuses} refusée(s).`);
if (refuses) process.exitCode = 1;
