// Optimisation automatique des images (docs/back-office/images.md).
//
// Shortcode `image` : {% image src, alt, { sizes, classe, cadrage, style, loading, width, height } %}
// A partir d'un chemin local (/uploads/..., /assets/...), produit au build des
// variantes AVIF, WebP et au format d'origine en plusieurs largeurs, et rend un
// <picture> avec srcset, sizes, width, height, loading et decoding.
// Les adresses externes (http, https), les SVG et les GIF passent tels quels.
//
// Le shortcode est synchrone (utilisable dans les macros Nunjucks) : les
// dimensions sont lues tout de suite, les fichiers sont générés en tâche de
// fond et attendus à la fin du build (événement eleventy.after).
//
// Cache : les variantes sont écrites dans .cache/eleventy-img/ (ignoré par Git),
// puis copiées dans dist/img/. Une image déjà générée n'est jamais recalculée.
// Dossier modifiable par la variable d'environnement IMAGES_CACHE_DIR.
const path = require("path");
const fs = require("fs");
// eleventy-img 6 exporte une fonction (CommonJS), les versions suivantes un module ESM
// dont la fonction est sous "default" : on accepte les deux.
const moduleImage = require("@11ty/eleventy-img");
const Image = moduleImage.default || moduleImage;

const RACINE = path.join(__dirname, "..");
const SOURCE = path.join(RACINE, "src");
const CACHE = path.resolve(RACINE, process.env.IMAGES_CACHE_DIR || ".cache/eleventy-img");
const URL_IMG = "/img/";
const LARGEURS = [400, 800, 1200, 1600];
const FORMATS_ORIGINE = { png: "png", jpg: "jpeg", jpeg: "jpeg", webp: "webp" };
const CADRAGES = { haut: "center top", bas: "center bottom", gauche: "left center", droite: "right center" };

const echapper = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const attributs = (obj) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== false && v !== "")
    .map(([k, v]) => ` ${k}="${echapper(v)}"`)
    .join("");

// Attributs dans l'ordre déjà utilisé par les gabarits (src, alt, class, style...).
const balise = (src, alt, o, extra) =>
  `<img${attributs({ src, ...(extra || {}) })} alt="${echapper(alt)}"${attributs({
    class: o.classe,
    style: o.styleFinal,
    loading: o.loadingFinal,
    decoding: o.decodingFinal,
    width: o.width,
    height: o.height
  })}>`;

const enAttente = [];
const fichiersUtilises = new Set();

function styleDe(o) {
  const morceaux = [];
  if (CADRAGES[o.cadrage]) morceaux.push(`object-position: ${CADRAGES[o.cadrage]}`);
  if (o.style) morceaux.push(String(o.style));
  return morceaux.join("; ");
}

function image(src, alt, options) {
  const o = Object.assign({}, options || {});
  o.styleFinal = styleDe(o);
  const chemin = String(src || "").trim();
  const ext = (chemin.split("?")[0].split(".").pop() || "").toLowerCase();
  const local = /^\/(uploads|assets)\//.test(chemin);
  const fichier = local ? path.join(SOURCE, decodeURI(chemin.split("?")[0])) : null;

  // Externe, SVG, GIF ou fichier introuvable : balise img telle quelle,
  // avec seulement les attributs donnés par le gabarit.
  if (!chemin || !local || !FORMATS_ORIGINE[ext] || !fs.existsSync(fichier)) {
    if (local && FORMATS_ORIGINE[ext] && !fs.existsSync(fichier)) {
      console.warn(`[images] fichier introuvable, image non optimisée : ${chemin}`);
    }
    // le style correctif (style) ne vaut que pour les variantes générées,
    // le cadrage s'applique à toutes les images
    o.styleFinal = styleDe({ cadrage: o.cadrage });
    o.loadingFinal = o.loading;
    o.decodingFinal = o.decoding;
    return balise(chemin, alt, o);
  }

  const formatOrigine = FORMATS_ORIGINE[ext];
  const formats = formatOrigine === "webp" ? ["avif", "webp"] : ["avif", "webp", formatOrigine];
  const reglages = {
    widths: LARGEURS,
    formats,
    outputDir: CACHE,
    urlPath: URL_IMG,
    sharpAvifOptions: { quality: 55 },
    sharpWebpOptions: { quality: 78 }
  };

  // Génération en tâche de fond (déjà en cache : rien n'est recalculé).
  enAttente.push(
    Image(fichier, reglages).catch((e) => {
      console.error(`[images] échec de génération pour ${chemin} : ${e.message}`);
      throw e;
    })
  );
  const stats = Image.statsSync(fichier, reglages);
  Object.values(stats).flat().forEach((s) => fichiersUtilises.add(path.basename(s.outputPath)));

  const sizes = o.sizes || "100vw";
  const repli = stats[formatOrigine];
  const plusGrande = repli[repli.length - 1];
  const imgRepli = repli.filter((s) => s.width <= 1200).pop() || repli[0];
  if (!o.width || !o.height) {
    o.width = plusGrande.width;
    o.height = plusGrande.height;
  }
  o.loadingFinal = o.loading || "lazy";
  o.decodingFinal = o.decoding || "async";

  const srcset = (liste) => liste.map((s) => s.srcset).join(", ");
  const sources = formats
    .filter((f) => f !== formatOrigine)
    .map((f) => `<source type="${stats[f][0].sourceType}" srcset="${echapper(srcset(stats[f]))}" sizes="${echapper(sizes)}">`)
    .join("");
  // display:contents : le <picture> ne crée pas de boîte, l'img garde la mise
  // en page prévue par la feuille de style (cover, position absolue...).
  return `<picture style="display:contents">${sources}${balise(imgRepli.url, alt, o, {
    srcset: srcset(repli),
    sizes
  })}</picture>`;
}

const desechapper = (s) =>
  String(s).replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

module.exports = function (eleventyConfig) {
  eleventyConfig.addShortcode("image", image);
  // Variante filtre : {{ src | imageResponsive(alt, { sizes: "..." }) | safe }}
  eleventyConfig.addFilter("imageResponsive", (src, alt, options) => image(src, alt, options));

  // Les cartes d'aperçu de référence produites en JS par le filtre « blocs »
  // (pages secteur, technologie, prestation...) : leur visuel passe aussi par
  // le shortcode. Seule la balise img du visuel est réécrite.
  eleventyConfig.addTransform("images-apercus-refs", function (contenu) {
    if (!(this.page.outputPath || "").endsWith(".html")) return contenu;
    if (contenu.indexOf('class="sect-ref-visuel') === -1) return contenu;
    return contenu.replace(
      /(<div class="sect-ref-visuel">)<img src="([^"]+)" alt="([^"]*)" loading="lazy" decoding="async">/g,
      (tout, div, src, alt) =>
        div + image(desechapper(src), desechapper(alt), { sizes: "(max-width: 767px) 100vw, 600px" })
    );
  });

  eleventyConfig.on("eleventy.before", () => {
    enAttente.length = 0;
    fichiersUtilises.clear();
  });

  // Attend la fin des générations puis copie les variantes utilisées dans dist/img/.
  eleventyConfig.on("eleventy.after", async ({ dir, directories }) => {
    const resultats = await Promise.allSettled(enAttente.splice(0));
    const echecs = resultats.filter((r) => r.status === "rejected");
    if (echecs.length) throw new Error(`[images] ${echecs.length} image(s) non générée(s)`);
    const cible = path.join(path.resolve((directories && directories.output) || dir.output), "img");
    fs.mkdirSync(cible, { recursive: true });
    for (const nom of fichiersUtilises) {
      const de = path.join(CACHE, nom);
      const vers = path.join(cible, nom);
      if (!fs.existsSync(vers) || fs.statSync(vers).size !== fs.statSync(de).size) fs.copyFileSync(de, vers);
    }
  });
};
