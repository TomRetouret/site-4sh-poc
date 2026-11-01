#!/usr/bin/env node
// Bibliothèque des blocs du CMS : recopie les types de blocs dans les collections.
//
// Sources (une par type de bloc) :
//   admin/config/blocs/<type>.yml   { profils: { <profil>: <rang> }, type: <définition Sveltia> }
//   admin/config/blocs/_profils.yml { <profil>: { description, i18n } }
// Cibles : les listes repérées dans admin/config/collections/*.yml par
//     # >>> BLOCS:<profil> (généré par scripts/generer-blocs.js : ne pas modifier à la main)
//     # <<< BLOCS
// Le repère d'ouverture fixe l'indentation de la clé « types: » écrite à sa place.
// Dans chaque profil, les blocs sont rangés par rang croissant (puis par nom).
// Mode d'emploi « Ajouter un bloc » : docs/back-office/schema-blocs.md.
// Ensuite : node scripts/assembler-config.js (assemble et valide admin/config.yml).
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "admin", "config", "collections");
const dossierBlocs = path.join(racine, "admin", "config", "blocs");
const dossierComposants = path.join(racine, "src", "_includes", "composants", "blocs");

const erreurs = [];
const PROFILS = yaml.load(fs.readFileSync(path.join(dossierBlocs, "_profils.yml"), "utf8")) || {};

// Lecture des blocs : un fichier par type, les fichiers commençant par _ sont réservés.
const blocs = fs.readdirSync(dossierBlocs)
  .filter((f) => f.endsWith(".yml") && !f.startsWith("_"))
  .sort()
  .map((f) => {
    const nom = f.replace(/\.yml$/, "");
    const source = yaml.load(fs.readFileSync(path.join(dossierBlocs, f), "utf8")) || {};
    const t = source.type || {};
    if (!/^[a-z][a-z0-9_]*$/.test(nom)) erreurs.push(`${f} : nom de fichier en minuscules, chiffres et _ uniquement`);
    if (t.name !== nom) erreurs.push(`${f} : type.name (« ${t.name} ») doit être le nom du fichier (« ${nom} »)`);
    if (!fs.existsSync(path.join(dossierComposants, nom + ".njk"))) {
      erreurs.push(`${f} : composant src/_includes/composants/blocs/${nom}.njk introuvable`);
    }
    const profils = source.profils || {};
    Object.keys(profils).forEach((p) => {
      if (!PROFILS[p]) erreurs.push(`${f} : profil « ${p} » absent de admin/config/blocs/_profils.yml`);
      if (typeof profils[p] !== "number") erreurs.push(`${f} : le rang du profil « ${p} » doit être un nombre`);
    });
    return { nom, profils, type: t };
  });

// Contrôle : chaque champ déclare required (true ou false).
function controler(champs, chemin) {
  (champs || []).forEach((c) => {
    const ici = chemin + "." + c.name;
    if (typeof c.required !== "boolean") erreurs.push(`required absent ou non booléen : ${ici}`);
    controler(c.fields, ici);
    if (c.field) controler([c.field], ici);
  });
}
blocs.forEach((b) => controler(b.type.fields, b.nom));
if (erreurs.length) {
  console.error(erreurs.join("\n"));
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
  if (!p) throw new Error(`profil inconnu : ${profil} (à déclarer dans admin/config/blocs/_profils.yml)`);
  return blocs
    .filter((b) => b.profils[profil] !== undefined)
    .sort((a, b) => a.profils[profil] - b.profils[profil] || a.nom.localeCompare(b.nom))
    .map((b) => {
      const copie = JSON.parse(JSON.stringify(b.type));
      if (p.i18n) copie.fields = copie.fields.map(avecI18n);
      return copie;
    });
}

const RE = /^([ \t]*)# >>> BLOCS:([a-z_]+)[^\n]*\n[\s\S]*?^[ \t]*# <<< BLOCS[^\n]*$/gm;
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
