// Environnement Nunjucks du navigateur pour le Storybook 4SH.
//
// Les filtres et shortcodes sont ceux du site : eleventy.config.js et eleventy/*.js sont
// exécutés ici avec une configuration Eleventy factice qui enregistre chaque filtre dans
// l'environnement Nunjucks. Les accès disque (fs) sont servis par les fichiers embarqués
// (virtual:4sh/fichiers) : libellés, fiches Équipe, existence des composants.
//
// Seuls écarts avec le build Eleventy :
//   - shortcode image : sort une simple <img> (pas de variantes AVIF/WebP, pas de srcset) ;
//   - filtres d'Eleventy lui-même : seul slugify est fourni (les composants n'en utilisent pas d'autre) ;
//   - collections (références, articles...) : vides, à passer dans le contexte si un bloc en a besoin.
import nunjucks from "nunjucks/browser/nunjucks-slim.js";
import gabarits, { shortcodes } from "virtual:4sh/gabarits";
import fichiers from "virtual:4sh/fichiers";
import { modules, dependances, slugifyEleventy } from "virtual:4sh/extensions";

// ---------------------------------------------------------------------------
// Équivalents navigateur de path et fs (chemins absolus depuis la racine du dépôt)
// ---------------------------------------------------------------------------
const normaliser = (p) => {
  const sortie = [];
  String(p).split("/").forEach((morceau) => {
    if (!morceau || morceau === ".") return;
    if (morceau === "..") sortie.pop();
    else sortie.push(morceau);
  });
  return "/" + sortie.join("/");
};
const pathNav = {
  sep: "/",
  join: (...m) => normaliser(m.join("/")),
  resolve: (...m) => normaliser(m.reduce((acc, x) => (String(x).startsWith("/") ? x : acc + "/" + x), "/")),
  dirname: (p) => normaliser(String(p).replace(/\/[^/]*\/?$/, "")),
  basename: (p, ext) => {
    const b = String(p).replace(/\/+$/, "").split("/").pop();
    return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b;
  },
  extname: (p) => {
    const m = /(\.[^./]+)$/.exec(String(p));
    return m ? m[1] : "";
  },
  relative: (de, vers) => normaliser(vers).slice(normaliser(de).length).replace(/^\//, "")
};

const introuvable = (p) => Object.assign(new Error(`ENOENT: ${p}`), { code: "ENOENT" });
const fsNav = {
  existsSync: (p) => {
    const n = normaliser(p);
    return n in fichiers || Object.keys(fichiers).some((f) => f.startsWith(n + "/"));
  },
  readFileSync: (p) => {
    const n = normaliser(p);
    if (!(n in fichiers)) throw introuvable(n);
    return fichiers[n];
  },
  readdirSync: (p) => {
    const n = normaliser(p);
    const enfants = new Set();
    Object.keys(fichiers).forEach((f) => {
      if (f.startsWith(n + "/")) enfants.add(f.slice(n.length + 1).split("/")[0]);
    });
    if (!enfants.size) throw introuvable(n);
    return [...enfants].sort();
  },
  statSync: (p) => {
    const n = normaliser(p);
    if (!fsNav.existsSync(n)) throw introuvable(n);
    return { isFile: () => n in fichiers, isDirectory: () => !(n in fichiers), mtimeMs: 0 };
  }
};

// Dépendances Node sans usage dans le navigateur (utilisées seulement au build Eleventy).
const neutre = new Proxy(function () {}, { get: () => neutre, apply: () => neutre });
const NEUTRES = ["gray-matter", "@11ty/eleventy-img"];

// ---------------------------------------------------------------------------
// Chargeur CommonJS minimal pour eleventy.config.js et eleventy/*.js
// ---------------------------------------------------------------------------
const processNav = { env: {}, cwd: () => "/" };
const charges = {};
function exiger(id, depuis) {
  if (id === "fs" || id === "node:fs") return fsNav;
  if (id === "path" || id === "node:path") return pathNav;
  if (id in dependances) return dependances[id];
  if (NEUTRES.includes(id)) return neutre;
  const chemin = id.startsWith(".") || id.startsWith("/") ? pathNav.resolve(depuis, id) : id;
  const cle = chemin in modules ? chemin : chemin + ".js" in modules ? chemin + ".js" : null;
  if (!cle) return neutre; // ex. src/assets/learning-scene.js (shortcode sans bloc)
  if (!charges[cle]) {
    const module = { exports: {} };
    charges[cle] = module;
    const dossier = pathNav.dirname(cle);
    const req = (x) => exiger(x, dossier);
    req.resolve = (x) => pathNav.resolve(dossier, x);
    req.cache = {};
    modules[cle](module, module.exports, req, dossier, cle, processNav);
  }
  return charges[cle].exports;
}

// ---------------------------------------------------------------------------
// Environnement Nunjucks
// ---------------------------------------------------------------------------
// Mêmes options que l'environnement Nunjucks d'Eleventy (échappement automatique).
export const env = new nunjucks.Environment(new nunjucks.PrecompiledLoader(gabarits), { autoescape: true });

const filtres = {};
const fonctionsShortcodes = {};
const configFactice = new Proxy(
  {
    addFilter: (n, f) => (filtres[n] = f),
    addNunjucksFilter: (n, f) => (filtres[n] = f),
    addShortcode: (n, f) => (fonctionsShortcodes[n] = f),
    addNunjucksShortcode: (n, f) => (fonctionsShortcodes[n] = f),
    addPairedShortcode: (n, f) => (fonctionsShortcodes[n] = f),
    addPairedNunjucksShortcode: (n, f) => (fonctionsShortcodes[n] = f)
  },
  { get: (cible, cle) => (cle in cible ? cible[cle] : () => {}) }
);

// Filtre d'Eleventy utilisé par les composants (bloc telechargement).
filtres.slugify = slugifyEleventy;
// La vraie configuration du site, qui charge elle-même eleventy/*.js.
exiger("/eleventy.config.js", "/")(configFactice);

// Shortcode image : le vrai code du site, qui sort une simple <img> quand le fichier
// n'est pas sur le disque, ce qui est toujours le cas ici. Son avertissement
// « fichier introuvable » n'a pas de sens dans Storybook : il est retiré.
if (fonctionsShortcodes.image) {
  const image = fonctionsShortcodes.image;
  fonctionsShortcodes.image = (...args) => {
    const avertir = console.warn;
    console.warn = () => {};
    try {
      return image(...args);
    } finally {
      console.warn = avertir;
    }
  };
}

Object.entries(filtres).forEach(([nom, f]) => env.addFilter(nom, f));

const shortcodeNavigateur = (nom, apparie) => ({
  tags: [nom],
  run(context, ...args) {
    const f = fonctionsShortcodes[nom];
    if (!f) return "";
    if (apparie) {
      const corps = args.pop();
      return new nunjucks.runtime.SafeString(f.call(context.ctx, corps(), ...args));
    }
    return new nunjucks.runtime.SafeString(f.call(context.ctx, ...args));
  }
});
shortcodes.simples.forEach((n) => env.addExtension(n, shortcodeNavigateur(n, false)));
shortcodes.apparies.forEach((n) => env.addExtension(n, shortcodeNavigateur(n, true)));

// Données du site lues comme Eleventy les lit (src/_data/<chemin>.json).
export function donnee(chemin) {
  const brut = fichiers["/src/_data/" + chemin + ".json"];
  return brut ? JSON.parse(brut) : undefined;
}
// Toutes les données d'un dossier de src/_data, indexées par nom de fichier.
export function dossierDonnees(chemin) {
  const prefixe = "/src/_data/" + chemin + "/";
  const sortie = {};
  Object.keys(fichiers)
    .filter((f) => f.startsWith(prefixe) && f.endsWith(".json") && !f.slice(prefixe.length).includes("/"))
    .forEach((f) => (sortie[f.slice(prefixe.length, -5)] = JSON.parse(fichiers[f])));
  return sortie;
}
