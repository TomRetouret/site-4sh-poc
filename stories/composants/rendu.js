// Rendu des macros partagées (src/_includes/composants/*.njk) pour les rubriques
// Fondations et Composants du Storybook 4SH.
//
//   import { appeler, enSection } from "./rendu.js";
//   appeler("page", "fil_ariane", ["Audit UX"], { parents: [...] });
//
// Le gabarit est celui du site, précompilé par .storybook/4sh/plugin-vite.mjs, avec les
// vrais filtres (accent, mdTitre...). La macro est appelée telle quelle, avec ses
// arguments positionnels puis ses arguments nommés : aucun balisage n'est recopié ici.
import nunjucks from "nunjucks/browser/nunjucks-slim.js";
import { env, donnee, dossierDonnees } from "../../.storybook/4sh/nunjucks-navigateur.js";

export { env, donnee, dossierDonnees };

const echapper = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Macros exportées par composants/<fichier>.njk (ex. "page", "cartes", "blocs/_section"). */
export function macros(fichier, contexte = {}) {
  const tpl = env.getTemplate(`composants/${fichier}.njk`, true);
  let erreur = null;
  let exportees = null;
  tpl.getExported(contexte, (e, r) => {
    erreur = e;
    exportees = r;
  });
  if (erreur) throw erreur;
  return exportees;
}

/**
 * Appelle une macro et renvoie son HTML.
 * @param {string} fichier  chemin sous composants/, sans .njk
 * @param {string} nom      nom de la macro
 * @param {Array}  args     arguments positionnels
 * @param {object} [nommes] arguments nommés (équivalent de nom=valeur en Nunjucks)
 * @param {string} [corps]  HTML passé à caller() (équivalent de {% call %}...{% endcall %})
 */
export function appeler(fichier, nom, args = [], nommes = null, corps = null) {
  try {
    const m = macros(fichier)[nom];
    if (typeof m !== "function") throw new Error(`Macro ${nom} absente de composants/${fichier}.njk`);
    const kw = Object.assign({}, nommes || {});
    if (corps != null) kw.caller = () => new nunjucks.runtime.SafeString(corps);
    const liste = [...args];
    if (Object.keys(kw).length) liste.push(nunjucks.runtime.makeKeywordArgs(kw));
    return String(m(...liste));
  } catch (e) {
    console.error(e);
    return `<pre class="sb-4sh-erreur">${echapper(e.message || e)}</pre>`;
  }
}

/** Un filtre du site (accent, mdTitre...), tel qu'enregistré par eleventy.config.js. */
export function filtre(nom, valeur, ...args) {
  return String(env.getFilter(nom)(valeur, ...args));
}

/** Enveloppe d'aperçu : <main>, section, conteneur. classe : classes de la section. */
export function enSection(html, { classe = "", style = "", famille = "", conteneur = true } = {}) {
  const f = famille ? ` class="famille-${famille}"` : "";
  const c = classe ? ` class="${classe}"` : "";
  const s = style ? ` style="${style}"` : "";
  const corps = conteneur ? `<div class="container">${html}</div>` : html;
  return `<main${f}><section${c}${s}>${corps}</section></main>`;
}

/** Bandeau « Exemple » au-dessus d'un composant rendu avec un contexte factice. */
export function exemple(texte) {
  return (
    `<p class="sb4-exemple" style="margin:0;padding:8px var(--marge);background:var(--fond-doux);` +
    `border-bottom:1px solid var(--bordure);font:700 13px/1.4 var(--titre);letter-spacing:.08em;` +
    `text-transform:uppercase;color:var(--texte-2)">Exemple · ${echapper(texte)}</p>`
  );
}

// ---------------------------------------------------------------------------
// Données d'exemple tirées du contenu réel du site.
// Les fiches Markdown (src/content/**) ne sont pas embarquées dans le Storybook :
// les valeurs ci-dessous en sont recopiées, avec le fichier d'origine en commentaire.
// ---------------------------------------------------------------------------

// src/content/references/filhet-allard.md (champs lus par carte_ref et apercu_projet)
export const FICHE_FILHET_ALLARD = {
  url: "/references/filhet-allard/",
  fileSlug: "filhet-allard",
  data: {
    titre: "Filhet-Allard",
    client: "Filhet-Allard",
    resume: "Extranet pour la santé et la prévoyance des assurés.",
    secteurs: ["Assurance"],
    technologies: ["Angular", "HTML", "Sass"],
    image: "/uploads/ancien-site/assets/img/png/references/fa/ref-fa-1.png",
    image_alt: "Filhet-Allard",
    image_decorative: false,
    logo: "/uploads/ancien-site/assets/img/png/references/fa/logo-fa.png"
  }
};

// src/content/technologies/angular.md : atouts et références
export const ANGULAR = {
  atouts: [
    {
      titre: "Un framework complet soutenu par Google",
      texte:
        "Angular n'est pas une bibliothèque à assembler, c'est un framework complet : routage, formulaires, injection de dépendances, tout est intégré et cohérent. Soutenu par Google, il avance avec une feuille de route claire et un rythme de versions régulier."
    },
    {
      titre: "TypeScript pour un code typé et maintenable",
      texte:
        "Angular repose sur TypeScript. Le typage statique attrape les erreurs avant la production et rend le code plus lisible, plus sûr à faire évoluer, surtout sur une grosse base et à plusieurs développeurs."
    },
    {
      titre: "Performance et scalabilité pour les applications d'entreprise",
      texte:
        "Angular fournit un cadre adapté aux applications comportant de nombreux écrans, flux et règles métier. Son architecture structurée facilite l'évolution d'une base de code importante, y compris lorsque le produit et l'équipe grandissent."
    },
    {
      titre: "Une architecture modulaire et testable",
      texte:
        "Le découpage en composants et en fonctionnalités rend l'application plus facile à tester et à faire évoluer. Chaque brique se teste isolément, ce qui limite les régressions."
    }
  ],
  references: [
    {
      fiche: "filhet-allard",
      titre: "Filhet-Allard - Assurance",
      texte:
        "Dans l'assurance, nous avons accompagné Filhet-Allard dans la migration de son front vers Angular, pour sortir d'une technologie qui n'était plus pérenne. Le portail clients et le portail assurés reposent sur une stack fullstack Java et Angular."
    },
    {
      titre: "Alogia - Silver Économie",
      texte:
        "Dans la Silver Économie, nous avons développé pour Alogia une Progressive Web App qui repose sur une gestion avancée des Reactive Forms d'Angular, au service de formulaires complexes."
    }
  ]
};

// src/content/prestations/audit-ux.md : en-tête (rendu par le hero de page.njk dans prestation.njk)
export const AUDIT_UX = {
  titre: "Audit UX & accessibilité",
  offre: "run",
  eyebrow: "Faire vivre & auditer",
  h1: "Offrez une expérience *fluide et inclusive* à vos utilisateurs",
  chapo:
    "Évaluez la qualité des interfaces de votre produit numérique pour optimiser l'ergonomie, la navigation et la satisfaction des utilisateurs, et garantir que le produit soit utilisable par tous.",
  ctas: [{ label: "Demander un audit UX", url: "/contact/" }]
};

// src/content/pages-secteurs/celebrads.md : chiffres (bandeau_chiffres dans secteur-libre.njk)
export const CHIFFRES_CELEBRADS = [
  { chiffre: "10 à 12", label: "semaines pour un déploiement clé en main" },
  { chiffre: "4 000", label: "pompes funèbres utilisatrices" },
  { chiffre: "350 000", label: "annonces publiées" },
  { chiffre: "+20", label: "départements couverts" }
];
