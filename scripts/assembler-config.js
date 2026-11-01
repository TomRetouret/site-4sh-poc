#!/usr/bin/env node
// Assemble admin/config.yml (Sveltia) à partir de admin/config/ :
//   00-base.yml          réglages généraux (backend, multilingue, circuit éditorial...)
//   collections/*.yml    une collection par fichier, dans l'ordre alphabétique des noms de fichier
// Ne jamais modifier admin/config.yml à la main : modifier les morceaux puis relancer
//   node scripts/assembler-config.js
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const racine = path.join(__dirname, "..");
const dossier = path.join(racine, "admin", "config");
const base = fs.readFileSync(path.join(dossier, "00-base.yml"), "utf8").trimEnd();
const morceaux = fs.readdirSync(path.join(dossier, "collections")).filter((f) => f.endsWith(".yml")).sort();
const entete = "# FICHIER GÉNÉRÉ par scripts/assembler-config.js à partir de admin/config/ : ne pas modifier à la main.\n";
const texte = entete + base + "\n\ncollections:\n" + morceaux.map((f) => fs.readFileSync(path.join(dossier, "collections", f), "utf8").trimEnd()).join("\n\n") + "\n";
const conf = yaml.load(texte); // lève une erreur si le YAML est invalide
const noms = conf.collections.map((c) => c.name);
const doublons = noms.filter((n, i) => noms.indexOf(n) !== i);
if (doublons.length) { console.error("Collections en double : " + doublons.join(", ")); process.exit(1); }
fs.writeFileSync(path.join(racine, "admin", "config.yml"), texte);
console.log(`admin/config.yml assemblé : ${morceaux.length} morceaux, collections : ${noms.join(", ")}`);
