// Composants / Hero de page : macro hero(titre, ...) de src/_includes/composants/page.njk,
// utilisée par prestation.njk, page-libre.njk, secteur-libre.njk, page-legale.njk...
import { appeler, AUDIT_UX } from "./rendu.js";

export default {
  title: "Composants/Hero de page",
  tags: ["autodocs"],
  render: ({ famille, titre, ...nommes }) =>
    `<main${famille ? ` class="famille-${famille}"` : ""}>${appeler("page", "hero", [titre], nommes)}</main>`,
  parameters: {
    feuilles: ["/assets/secteurs.css"],
    docs: {
      description: {
        component:
          "Haut des pages éditoriales hors blocs (prestations, page libre, pages de secteur, pages légales). " +
          "Malgré le commentaire du gabarit (« hero sombre »), `charte.css` en fait un hero **sobre** : fond blanc, " +
          "H1 Manrope 800 encre, chapô 20 px, sans tracé manuscrit (`trace` n'a plus d'effet visible).\n\n" +
          "Avec `offre`, le surtitre devient une étiquette d'offre (barre 24 × 4 et « 4SH Run · ... ») ; la page pose " +
          "aussi la classe `famille-*` sur le `<body>`, reproduite ici par le contrôle « Famille de la page ». " +
          "Dans le H1, un mot entre `*astérisques*` s'affiche en rouge (filtre `accent`).\n\n" +
          "Pour les pages composées de blocs, voir plutôt **Blocs/Hero**.\n\n" +
          "Source : `src/_includes/composants/page.njk` (macro `hero`), `src/_includes/prestation.njk`, " +
          "`src/assets/charte.css` (« Hero sobre des pages internes »), `src/assets/secteurs.css`."
      },
      story: { height: "560px" }
    }
  },
  argTypes: {
    titre: { name: "Titre de la page", control: "text", description: "Repli du H1 et dernier niveau du fil d'Ariane." },
    h1: { name: "H1", control: "text", description: "Si différent du titre ; accent avec `*mot*`." },
    eyebrow: { name: "Surtitre", control: "text" },
    offre: { name: "Offre", control: "select", options: ["", "build", "run", "learning"], description: "Transforme le surtitre en étiquette d'offre." },
    famille: { name: "Famille de la page", control: "select", options: ["", "build", "run", "formation"], description: "Classe `famille-*` du `<body>` (calculée par `base.njk`)." },
    chapo: { name: "Chapô", control: "text" },
    parents: { name: "Fil d'Ariane : niveaux intermédiaires", control: "object" },
    ariane: { name: "Afficher le fil d'Ariane", control: "boolean" },
    logo: { name: "Logo", control: "text", description: "URL d'un logo affiché au-dessus du H1." },
    ctas: { name: "Boutons", control: "object", description: "`[{ label, url, fantome, externe }]` ; `fantome: true` : bouton secondaire." }
  },
  args: {
    titre: AUDIT_UX.titre,
    h1: AUDIT_UX.h1,
    eyebrow: AUDIT_UX.eyebrow,
    offre: AUDIT_UX.offre,
    famille: "run",
    chapo: AUDIT_UX.chapo,
    parents: [],
    ariane: true,
    logo: "",
    ctas: AUDIT_UX.ctas
  }
};

// En-tête de src/content/prestations/audit-ux.md, comme prestation.njk l'appelle.
export const Prestation = { name: "Page de prestation (offre Run)" };

// Comme page-libre.njk : surtitre simple, sans offre, deux boutons.
export const SansOffre = {
  name: "Sans offre, deux boutons",
  args: {
    offre: "",
    famille: "",
    eyebrow: "Prestation",
    ctas: [
      { label: "Parlons de votre projet", url: "/contact/" },
      { label: "Voir nos réalisations", url: "/references/", fantome: true }
    ]
  }
};

// Comme secteur-libre.njk (src/content/pages-secteurs/celebrads.md), avec logo.
export const AvecLogo = {
  name: "Page de secteur avec logo",
  args: {
    titre: "Celebrads",
    h1: "Celebrads - La solution dédiée aux groupes de presse pour la publication des avis de décès",
    eyebrow: "Solution",
    offre: "",
    famille: "",
    chapo:
      "Celebrads est une solution dédiée à la publication en ligne des avis de décès, conçue spécifiquement pour les groupes de presse.",
    parents: [{ label: "Secteurs", url: "/" }],
    logo: "/uploads/ancien-site/assets/img/svg/logo-celebrads-color.svg",
    ctas: [{ label: "Demandez une démo", url: "/#contact" }]
  },
  parameters: { docs: { story: { height: "680px" } } }
};
