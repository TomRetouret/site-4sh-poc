// Composants / Cartes : macros de src/_includes/composants/cartes.njk.
import { appeler, enSection, FICHE_FILHET_ALLARD, ANGULAR } from "./rendu.js";

export default {
  title: "Composants/Cartes",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Les cartes partagées par plusieurs gabarits (`src/_includes/composants/cartes.njk`) :\n\n" +
          "- `carte_ref(ref, une)` : fiche référence du catalogue (index des références, `bloc_references`).\n" +
          "- `apercu_projet(titre, texte, fiche, lien, libelle_lien)` : aperçu d'un projet sur les fiches technologie ; " +
          "visuel et logo tirés de la fiche référence quand elle existe, sinon le nom du client en grand.\n" +
          "- `carte_atout(atout, rang)` : carte numérotée « pourquoi nous » (notre démarche, fiches technologie).\n\n" +
          "Angles vifs, filet de 1 px, aucune ombre ni soulèvement au survol (`charte.css`, « Cartes génériques »).\n\n" +
          "Les fiches références sont des fichiers Markdown que le Storybook n'embarque pas : la fiche d'exemple " +
          "recopie les champs de `src/content/references/filhet-allard.md`. Les images ne sont pas optimisées " +
          "(voir `docs/storybook.md`, « Images non optimisées »).\n\n" +
          "Source : `src/_includes/composants/cartes.njk`, `src/assets/references.css`, `src/assets/secteurs.css`, " +
          "`src/assets/logiciel-metier.css`, `src/assets/charte.css`."
      },
      story: { height: "620px" }
    }
  }
};

// Fiche reconstituée à partir des contrôles (les champs que carte_ref lit dans ref.data).
const fiche = (a) => ({
  url: a.url,
  fileSlug: "exemple",
  data: {
    titre: a.titre,
    client: a.client,
    resume: a.resume,
    secteurs: a.secteurs || [],
    technologies: a.technologies || [],
    image: a.image,
    image_alt: a.titre,
    logo: a.logo
  }
});

const champsFiche = {
  titre: { name: "Titre", control: "text" },
  client: { name: "Client", control: "text" },
  resume: { name: "Résumé", control: "text" },
  secteurs: { name: "Secteurs", control: "object", description: "Seul le premier est affiché." },
  technologies: { name: "Technologies", control: "object", description: "Quatre au plus sont affichées." },
  image: { name: "Image", control: "text", description: "Vide : nom du client en grand sur fond nuit." },
  logo: { name: "Logo", control: "text", description: "Vide : nom du client dans le cartouche." },
  url: { name: "Adresse de la fiche", control: "text" }
};

export const CarteReference = {
  name: "Carte référence (carte_ref)",
  args: { ...FICHE_FILHET_ALLARD.data, url: FICHE_FILHET_ALLARD.url, une: false },
  argTypes: { ...champsFiche, une: { name: "Format « une »", control: "boolean", description: "Pleine largeur, visuel à gauche." } },
  parameters: { feuilles: ["/assets/references.css"] },
  render: (a) =>
    enSection(
      `<div class="ref-grille">${appeler("cartes", "carte_ref", [fiche(a), a.une])}</div>`,
      { classe: "fond-doux", style: "padding:48px 0" }
    )
};

export const CarteReferenceSansImage = {
  ...CarteReference,
  name: "Carte référence sans image ni logo",
  args: { ...CarteReference.args, image: "", logo: "" }
};

export const ApercuProjet = {
  name: "Aperçu projet (apercu_projet)",
  args: {
    titre: ANGULAR.references[0].titre,
    texte: ANGULAR.references[0].texte,
    avec_fiche: true,
    libelle_lien: "Voir la référence"
  },
  argTypes: {
    titre: { name: "Titre", control: "text", description: "Imposé par la page ; sans fiche, la partie avant « - » sert de nom." },
    texte: { name: "Texte", control: "text" },
    avec_fiche: { name: "Fiche référence trouvée", control: "boolean", description: "Exemple : fiche Filhet-Allard." },
    libelle_lien: { name: "Libellé du lien", control: "text" }
  },
  parameters: { feuilles: ["/assets/logiciel-metier.css"] },
  render: ({ titre, texte, avec_fiche, libelle_lien }) => {
    const f = avec_fiche ? FICHE_FILHET_ALLARD : null;
    return enSection(
      `<div class="sect-refs-inline">${appeler("cartes", "apercu_projet", [titre, texte, f, f ? f.url : null, libelle_lien])}</div>`,
      { style: "padding:48px 0" }
    );
  }
};

// Les deux références de la fiche technologie Angular, comme technologie.njk les affiche.
export const ApercusFicheTechnologie = {
  name: "Aperçus d'une fiche technologie",
  parameters: { feuilles: ["/assets/logiciel-metier.css"], docs: { story: { height: "760px" } } },
  render: () =>
    enSection(
      `<p class="eyebrow">Références clients</p><div class="sect-refs-inline">${ANGULAR.references
        .map((r) => {
          const f = r.fiche === "filhet-allard" ? FICHE_FILHET_ALLARD : null;
          return appeler("cartes", "apercu_projet", [r.titre, r.texte, f, f ? f.url : null]);
        })
        .join("")}</div>`,
      { style: "padding:48px 0" }
    )
};

export const CarteAtout = {
  name: "Carte atout (carte_atout)",
  args: { titre: ANGULAR.atouts[0].titre, texte: ANGULAR.atouts[0].texte, rang: 1 },
  argTypes: {
    titre: { name: "Titre", control: "text" },
    texte: { name: "Texte", control: "text" },
    rang: { name: "Rang", control: "number", description: "Numéro affiché en couleur texte de l'offre ; vide : pas de numéro." }
  },
  parameters: { feuilles: ["/assets/logiciel-metier.css"], docs: { story: { height: "420px" } } },
  render: ({ titre, texte, rang }) =>
    enSection(`<div style="max-width:320px">${appeler("cartes", "carte_atout", [{ titre, texte }, rang || null])}</div>`, {
      style: "padding:48px 0"
    })
};

// Grille des atouts de la fiche technologie Angular (src/content/technologies/angular.md).
export const GrilleAtouts = {
  name: "Grille d'atouts (fiche Angular)",
  args: { famille: "build" },
  argTypes: { famille: { name: "Famille de la page", control: "select", options: ["", "build", "run", "formation"] } },
  parameters: { feuilles: ["/assets/logiciel-metier.css"], docs: { story: { height: "520px" } } },
  render: ({ famille }) =>
    enSection(
      `<p class="eyebrow">Pourquoi Angular ?</p><div class="atouts" style="grid-template-columns:repeat(4,1fr)">${ANGULAR.atouts
        .map((a, i) => appeler("cartes", "carte_atout", [a, i + 1]))
        .join("")}</div>`,
      { famille, style: "padding:48px 0" }
    )
};
