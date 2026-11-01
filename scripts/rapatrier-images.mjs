#!/usr/bin/env node
// Rapatrie dans le dépôt les images encore servies par l'ancien site (www.4sh.fr),
// puis réécrit les liens pour qu'ils pointent vers /uploads/ancien-site/...
//
// Usage, depuis la racine du dépôt (réseau ouvert vers www.4sh.fr requis) :
//   node scripts/rapatrier-images.mjs --essai   liste ce qui serait fait, sans rien changer
//   node scripts/rapatrier-images.mjs           télécharge puis réécrit les liens
//
// Les fichiers déjà téléchargés ne sont pas retéléchargés. Un lien n'est réécrit
// que si son image a bien été téléchargée : rien ne casse en cas d'échec partiel.
import fs from "node:fs";
import path from "node:path";

const RACINE = process.cwd();
const DOSSIERS = ["src"];
const EXTENSIONS_TEXTE = new Set([".md", ".json", ".njk", ".js", ".yml", ".yaml", ".html"]);
const MOTIF = /https?:\/\/(?:www\.)?4sh\.fr\/[^"'\s)<>]*?\.(?:png|jpe?g|svg|webp|gif)/gi;
const CIBLE = path.join("src", "uploads", "ancien-site");
const PUBLIC = "/uploads/ancien-site";
const essai = process.argv.includes("--essai");

const fichiers = [];
const parcourir = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!["node_modules", "uploads"].includes(e.name)) parcourir(p); }
    else if (EXTENSIONS_TEXTE.has(path.extname(e.name))) fichiers.push(p);
  }
};
DOSSIERS.forEach((d) => parcourir(path.join(RACINE, d)));

const usages = new Map(); // url -> nombre d'occurrences
for (const f of fichiers) {
  for (const m of fs.readFileSync(f, "utf8").matchAll(MOTIF)) usages.set(m[0], (usages.get(m[0]) || 0) + 1);
}
const cheminLocal = (url) => decodeURIComponent(new URL(url).pathname).replace(/^\/+/, "");
console.log(`${usages.size} images distinctes, ${[...usages.values()].reduce((a, b) => a + b, 0)} liens, dans ${fichiers.length} fichiers lus.`);
if (essai) { for (const u of usages.keys()) console.log(`  ${u}  ->  ${PUBLIC}/${cheminLocal(u)}`); process.exit(0); }

const reussies = new Set(), echecs = [];
for (const url of usages.keys()) {
  const dest = path.join(RACINE, CIBLE, cheminLocal(url));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { reussies.add(url); continue; }
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    reussies.add(url);
    process.stdout.write(".");
  } catch (e) { echecs.push(`${url} (${e.message})`); }
}
console.log(`\n${reussies.size} images présentes dans ${CIBLE}, ${echecs.length} échecs.`);

let modifies = 0;
for (const f of fichiers) {
  const avant = fs.readFileSync(f, "utf8");
  const apres = avant.replace(MOTIF, (u) => (reussies.has(u) ? `${PUBLIC}/${cheminLocal(u)}` : u));
  if (apres !== avant) { fs.writeFileSync(f, apres); modifies++; }
}
console.log(`${modifies} fichiers réécrits.`);
if (echecs.length) { console.log("Échecs (liens laissés tels quels) :"); echecs.forEach((e) => console.log("  " + e)); process.exitCode = 1; }
