// Bloc « chiffres_cles » : src/_includes/composants/blocs/chiffres_cles.njk
// Champs : docs/back-office/schema-blocs.md, section « chiffres_cles ».
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Chiffres clés",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("chiffres_cles", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Bandeau de 2 à 4 chiffres clés. Sur l'accueil, le chiffre est mis en avant (`<b><i>`) ; " +
          "sur les pages d'offre (gabarit `offre`), le balisage reprend celui des pages intérieures. " +
          "Champs du back-office : `docs/back-office/schema-blocs.md`, section « chiffres_cles »."
      },
      story: { height: "260px" }
    }
  },
  argTypes: {
    chiffres: {
      name: "Chiffres",
      control: "object",
      description:
        "Liste de 2 à 4 éléments `{ valeur, texte, note }` : `valeur` « Chiffre » (obligatoire), " +
        "`texte` « Libellé » (obligatoire), `note` « Note (petit texte) »."
    }
  }
};

// Bandeau de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "chiffres_cles")
};

// Bandeau de la page Logiciel métier, gabarit des pages d'offre.
export const PageOffre = {
  name: "Page d'offre",
  args: blocExemple("logiciel_metier", "chiffres_cles"),
  parameters: {
    feuilles: ["/assets/logiciel-metier.css"],
    bloc: { gabarit: "offre" }
  }
};

// Deux chiffres seulement, sans note : le minimum accepté par le back-office.
export const DeuxChiffres = {
  name: "Deux chiffres, sans note",
  args: {
    chiffres: [
      { valeur: "2007", texte: "Année de création", note: "" },
      { valeur: "48h", texte: "Pour un premier retour", note: "" }
    ]
  }
};
