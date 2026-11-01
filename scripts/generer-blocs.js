#!/usr/bin/env node
// Recopie les types de blocs de la bibliothèque (admin/config/blocs.yml, source unique)
// dans les collections du CMS, entre les repères :
//     # >>> BLOCS:<profil> (généré par scripts/generer-blocs.js : ne pas modifier à la main)
//     # <<< BLOCS
// Le repère d'ouverture fixe l'indentation de la clé « types: » écrite à sa place.
// Profils : quels blocs sont autorisés, et faut-il ajouter i18n: true (accueil bilingue).
// Ensuite : node scripts/assembler-config.js (assemble et valide admin/config.yml).
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "admin", "config", "collections");
const biblio = yaml.load(fs.readFileSync(path.join(racine, "admin", "config", "blocs.yml"), "utf8")).types;

const PROFILS = {
  // Accueil (français et anglais) : les 11 blocs d'origine.
  accueil: {
    i18n: true,
    blocs: ["hero", "logos_clients", "cartes_offres", "chiffres_cles", "cartes_secteurs", "methode_4d",
      "projets", "technologies", "faq", "derniers_articles", "equipe"]
  },
  // Pages de démonstration : toute la bibliothèque.
  demo: { i18n: false, blocs: biblio.map((t) => t.name) },
  // Pages d'offre (Logiciel métier, puis les autres pages d'offre).
  offre: {
    i18n: false,
    blocs: ["hero", "chiffres_cles", "texte_simple", "etapes", "benefices", "technologies", "projet_vedette",
      "projets", "cartes_secteurs", "logos_clients", "equipe", "derniers_articles", "faq", "appel_action"]
  }
};

// Contrôle : chaque champ déclare required (true ou false).
const manquants = [];
function controler(champs, chemin) {
  (champs || []).forEach((c) => {
    const ici = chemin + "." + c.name;
    if (typeof c.required !== "boolean") manquants.push(ici);
    controler(c.fields, ici);
    if (c.field) controler([c.field], ici);
  });
}
biblio.forEach((t) => controler(t.fields, t.name));
if (manquants.length) {
  console.error("required absent ou non booléen : " + manquants.join(", "));
  process.exit(1);
}

// Ajoute i18n: true à chaque champ, sous-champs compris (convention de l'accueil).
function avecI18n(champ) {
  const c = Object.assign({}, champ);
  if (c.fields) c.fields = c.fields.map(avecI18n);
  if (c.field) c.field = avecI18n(c.field);
  c.i18n = true;
  return c;
}

function typesDu(profil) {
  const p = PROFILS[profil];
  if (!p) throw new Error("profil inconnu : " + profil);
  return p.blocs.map((nom) => {
    const t = biblio.find((x) => x.name === nom);
    if (!t) throw new Error(`bloc « ${nom} » absent de admin/config/blocs.yml`);
    const copie = JSON.parse(JSON.stringify(t));
    if (p.i18n) copie.fields = copie.fields.map(avecI18n);
    return copie;
  });
}

const RE = /^([ \t]*)# >>> BLOCS:([a-z]+)[^\n]*\n[\s\S]*?^[ \t]*# <<< BLOCS[^\n]*$/gm;
let total = 0;
fs.readdirSync(dossier).filter((f) => f.endsWith(".yml")).sort().forEach((f) => {
  const fichier = path.join(dossier, f);
  const avant = fs.readFileSync(fichier, "utf8");
  let n = 0;
  const apres = avant.replace(RE, (tout, indent, profil) => {
    n += 1;
    const corps = yaml.dump({ types: typesDu(profil) }, { lineWidth: -1, noRefs: true })
      .trimEnd().split("\n").map((l) => indent + l).join("\n");
    return `${indent}# >>> BLOCS:${profil} (généré par scripts/generer-blocs.js : ne pas modifier à la main)\n` +
      `${corps}\n${indent}# <<< BLOCS`;
  });
  if (n) {
    total += n;
    if (apres !== avant) fs.writeFileSync(fichier, apres);
    console.log(`${f} : ${n} liste(s) de blocs ${apres !== avant ? "mise(s) à jour" : "inchangée(s)"}`);
  }
});
if (!total) console.warn("Aucun repère « # >>> BLOCS:<profil> » trouvé.");
