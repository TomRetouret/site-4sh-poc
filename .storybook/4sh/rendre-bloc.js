// rendreBloc : la seule fonction à connaître pour écrire une story de bloc.
//
//   import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
//   export const Defaut = { render: (args) => rendreBloc("chiffres_cles", args) };
//
// Rend le composant src/_includes/composants/blocs/<type>.njk avec sa macro
// bloc(b, ctx, serre), dans un <main>, avec le même contexte que l'aiguilleur
// (composants/blocs/aiguilleur.njk). Si le composant déclare une feuille de styles
// propre ({% set feuille = "/assets/blocs.css" %}), elle est chargée juste avant lui,
// comme sur le site.
import { env, donnee, dossierDonnees } from "./nunjucks-navigateur.js";

export { donnee };

/**
 * @param {string} type      type du bloc (nom du fichier .njk, ex. "hero")
 * @param {object} args      champs du bloc (les args de la story)
 * @param {object} [options]
 * @param {string} [options.gabarit]    "offre" pour le balisage des pages d'offre
 * @param {string} [options.filAriane]  nom de la page dans le fil d'Ariane (hero sobre)
 * @param {string} [options.urlPage]    adresse simulée de la page (langue des libellés : /en/...)
 * @param {boolean} [options.serre]     le bloc suit une section blanche (marge haute retirée)
 * @param {string} [options.famille]    couleur d'offre : build, run ou formation (classe famille-*)
 * @param {Array}  [options.etapes4d]   étapes du hero expressif (défaut : celles de l'accueil)
 * @param {object} [options.contexte]   champs ajoutés ou remplacés dans ctx (références, articles...)
 * @returns {string} le HTML du bloc dans un <main>
 */
export function rendreBloc(type, args, options = {}) {
  const anglais = /^\/en(\/|$)/.test(options.urlPage || "");
  const site = donnee(anglais ? "en/site" : "site");
  const blog = donnee("blog_fallback");
  const temoignages = dossierDonnees(anglais ? "temoignages/en" : "temoignages/fr");
  const ctx = Object.assign(
    {
      site,
      blog,
      temoignages,
      etapes_4d: options.etapes4d || etapesAccueil(),
      url_page: options.urlPage || "/storybook/",
      gabarit: options.gabarit,
      fil_ariane: options.filAriane,
      references: [],
      appels_action: dossierDonnees("appels_action")
    },
    options.contexte || {}
  );
  const donnees = { type, b: Object.assign({ type }, args), ctx, serre: !!options.serre };
  let html;
  let feuille = "";
  try {
    html = env.render("storybook/rendre-bloc.njk", donnees);
    feuille = env.render("storybook/feuille-bloc.njk", donnees).trim();
  } catch (e) {
    console.error(e);
    html = `<pre class="sb-4sh-erreur">${String(e.message || e).replace(/</g, "&lt;")}</pre>`;
  }
  const classe = options.famille ? ` class="famille-${options.famille}"` : "";
  const lien = feuille ? `<link rel="stylesheet" href="${feuille}">\n` : "";
  return `<main${classe}>\n${lien}${html}\n</main>`;
}

// Étapes du premier bloc methode_4d de l'accueil (comme le fait l'aiguilleur).
function etapesAccueil() {
  const accueil = donnee("contenus/fr/accueil") || {};
  const m4d = (accueil.blocs || []).find((b) => b && b.type === "methode_4d");
  return m4d ? m4d.etapes : [];
}

// Premier bloc d'un type dans un fichier de contenu (src/_data/contenus/<langue>/<page>.json) :
// sert de données d'exemple aux stories, toujours à jour avec le contenu réel.
export function blocExemple(page, type, langue = "fr") {
  const contenu = donnee(`contenus/${langue}/${page}`) || {};
  const b = (contenu.blocs || []).find((x) => x && x.type === type);
  if (!b) throw new Error(`Aucun bloc ${type} dans src/_data/contenus/${langue}/${page}.json`);
  const { masquer, type: _type, ...champs } = JSON.parse(JSON.stringify(b));
  return champs;
}
