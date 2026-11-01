// Plugin Vite du Storybook 4SH (s'exécute dans Node, au lancement de Storybook).
//
// Il fournit au navigateur trois modules virtuels, construits à partir des vrais
// fichiers du site, sans recopie :
//
//   virtual:4sh/gabarits    gabarits Nunjucks de src/_includes/composants/**, précompilés
//                           (le navigateur n'embarque que le moteur d'exécution de Nunjucks)
//   virtual:4sh/fichiers    fichiers de données (src/_data/**/*.json) et liste des composants,
//                           servis aux filtres du site à la place du disque (fs)
//   virtual:4sh/extensions  eleventy.config.js et eleventy/*.js, enveloppés pour tourner dans
//                           le navigateur : ce sont les filtres et shortcodes du site, pas des copies
//
// Une modification d'un .njk, d'un fichier de données ou d'un filtre recharge l'aperçu.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import nunjucks from "nunjucks";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const INCLUDES = path.join(RACINE, "src", "_includes");
const COMPOSANTS = path.join(INCLUDES, "composants");
const DONNEES = path.join(RACINE, "src", "_data");
const EXTENSIONS = path.join(RACINE, "eleventy");

const ID = {
  gabarits: "virtual:4sh/gabarits",
  fichiers: "virtual:4sh/fichiers",
  extensions: "virtual:4sh/extensions"
};

// Gabarits propres au Storybook (jamais publiés sur le site).
export const GABARITS_STORYBOOK = {
  // Rend un bloc exactement comme l'aiguilleur (composants/blocs/aiguilleur.njk).
  "storybook/rendre-bloc.njk":
    '{% import "composants/blocs/" + type + ".njk" as composant %}{{ composant.bloc(b, ctx, serre) }}',
  // Feuille de styles propre déclarée par un composant ({% set feuille = "..." %}).
  "storybook/feuille-bloc.njk":
    '{% import "composants/blocs/" + type + ".njk" as composant %}{{ composant.feuille or "" }}'
};

const lister = (dossier, filtre) => {
  if (!fs.existsSync(dossier)) return [];
  return fs.readdirSync(dossier, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dossier, e.name);
    if (e.isDirectory()) return lister(p, filtre);
    return filtre(e.name) ? [p] : [];
  });
};
const relatif = (p) => "/" + path.relative(RACINE, p).split(path.sep).join("/");

// Noms des shortcodes déclarés par le site : Nunjucks doit les connaître pour précompiler
// les balises {% image ... %}. On exécute la vraie configuration avec une configuration factice.
function nomsShortcodes() {
  const require = createRequire(import.meta.url);
  const fichier = path.join(RACINE, "eleventy.config.js");
  Object.keys(require.cache).forEach((k) => {
    if (k.startsWith(EXTENSIONS) || k === fichier) delete require.cache[k];
  });
  const simples = new Set();
  const apparies = new Set();
  const config = new Proxy(
    {
      addShortcode: (n) => simples.add(n),
      addNunjucksShortcode: (n) => simples.add(n),
      addPairedShortcode: (n) => apparies.add(n),
      addPairedNunjucksShortcode: (n) => apparies.add(n)
    },
    { get: (cible, cle) => (cle in cible ? cible[cle] : () => {}) }
  );
  require(fichier)(config);
  return { simples: [...simples], apparies: [...apparies] };
}

// Balise de shortcode à la manière d'Eleventy : {% nom arg1, arg2 %} ou {% nom %}...{% endnom %}.
// Côté Node, seule l'analyse sert (précompilation) ; le navigateur fournit run().
export function baliseShortcode(nom, apparie) {
  return {
    tags: [nom],
    parse(parser, nodes) {
      const tok = parser.nextToken();
      const args = parser.parseSignature(true, true);
      if (args.children.length === 0) args.addChild(new nodes.Literal(0, 0, ""));
      parser.advanceAfterBlockEnd(tok.value);
      if (apparie) {
        const corps = parser.parseUntilBlocks("end" + nom);
        parser.advanceAfterBlockEnd();
        return new nodes.CallExtension(this, "run", args, [corps]);
      }
      return new nodes.CallExtension(this, "run", args);
    },
    run() {
      return "";
    }
  };
}

function moduleGabarits() {
  const { simples, apparies } = nomsShortcodes();
  const env = new nunjucks.Environment(null, { autoescape: true });
  simples.forEach((n) => env.addExtension(n, baliseShortcode(n, false)));
  apparies.forEach((n) => env.addExtension(n, baliseShortcode(n, true)));
  const sources = {};
  lister(COMPOSANTS, (n) => n.endsWith(".njk")).forEach((f) => {
    sources[path.relative(INCLUDES, f).split(path.sep).join("/")] = fs.readFileSync(f, "utf8");
  });
  Object.assign(sources, GABARITS_STORYBOOK);
  const lignes = Object.entries(sources).map(([nom, src]) => {
    let code;
    try {
      code = nunjucks.precompileString(src, { name: nom, env, wrapper: (t) => t[0].template });
    } catch (e) {
      throw new Error(`[storybook 4SH] gabarit ${nom} : ${e.message}`);
    }
    return `  ${JSON.stringify(nom)}: (function () {\n${code}\n})()`;
  });
  return (
    `// Gabarits Nunjucks précompilés (src/_includes/composants)\n` +
    `export const shortcodes = ${JSON.stringify({ simples, apparies })};\n` +
    `export default {\n${lignes.join(",\n")}\n};\n`
  );
}

function moduleFichiers() {
  const fichiers = {};
  lister(DONNEES, (n) => n.endsWith(".json")).forEach((f) => {
    fichiers[relatif(f)] = fs.readFileSync(f, "utf8");
  });
  // Les composants n'ont besoin que d'exister (filtre blocExiste) : contenu non embarqué.
  lister(COMPOSANTS, (n) => n.endsWith(".njk")).forEach((f) => {
    fichiers[relatif(f)] = "";
  });
  // Les extensions du site : eleventy.config.js les découvre en listant ce dossier.
  lister(EXTENSIONS, (n) => n.endsWith(".js")).forEach((f) => {
    fichiers[relatif(f)] = "";
  });
  return `export default ${JSON.stringify(fichiers)};\n`;
}

// Modules CommonJS du site (eleventy.config.js, eleventy/*.js) enveloppés en fonctions,
// avec un require() qui sert les équivalents navigateur de fs, path et des dépendances.
function moduleExtensions() {
  const fichiers = [path.join(RACINE, "eleventy.config.js"), ...lister(EXTENSIONS, (n) => n.endsWith(".js"))];
  const corps = fichiers.map((f) => {
    const src = fs.readFileSync(f, "utf8");
    return (
      `  ${JSON.stringify(relatif(f))}: function (module, exports, require, __dirname, __filename, process) {\n` +
      `${src}\n  }`
    );
  });
  const slugify = path.join(RACINE, "node_modules", "@11ty", "eleventy", "src", "Filters", "Slugify.js");
  return (
    `import MarkdownIt from "markdown-it";\n` +
    `import slugifyEleventy from ${JSON.stringify(slugify.split(path.sep).join("/"))};\n` +
    `export { slugifyEleventy };\n` +
    `export const dependances = { "markdown-it": MarkdownIt };\n` +
    `export const modules = {\n${corps.join(",\n")}\n};\n`
  );
}

export default function storybook4sh() {
  return {
    name: "storybook-4sh",
    enforce: "pre",
    resolveId(id) {
      if (Object.values(ID).includes(id)) return "\0" + id;
      return null;
    },
    load(id) {
      if (id === "\0" + ID.gabarits) return moduleGabarits();
      if (id === "\0" + ID.fichiers) return moduleFichiers();
      if (id === "\0" + ID.extensions) return moduleExtensions();
      return null;
    },
    configureServer(server) {
      const surveiller = [COMPOSANTS, DONNEES, EXTENSIONS, path.join(RACINE, "eleventy.config.js")];
      server.watcher.add(surveiller);
      const recharger = (fichier) => {
        const cible = fichier.startsWith(COMPOSANTS) && fichier.endsWith(".njk")
          ? [ID.gabarits, ID.fichiers]
          : fichier.startsWith(DONNEES) && fichier.endsWith(".json")
          ? [ID.fichiers]
          : fichier.startsWith(EXTENSIONS) || fichier.endsWith("eleventy.config.js")
          ? [ID.extensions, ID.gabarits]
          : [];
        if (!cible.length) return;
        cible.forEach((id) => {
          const m = server.moduleGraph.getModuleById("\0" + id);
          if (m) server.moduleGraph.invalidateModule(m);
        });
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("change", recharger);
      server.watcher.on("add", recharger);
      server.watcher.on("unlink", recharger);
    }
  };
}
