// Bloc « chiffres_compteurs » : src/_includes/composants/blocs/chiffres_compteurs.njk
// Champs : admin/config/blocs/chiffres_compteurs.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Chiffres/Chiffres animés",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("chiffres_compteurs", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Bandeau sombre de 2 à 6 chiffres qui défilent de 0 à leur valeur quand ils apparaissent à l'écran. " +
          "Au-delà de 4 chiffres, le bandeau défile sur téléphone. Dans Storybook, le script global du site (`mouvement.js`) " +
          "n'est pas chargé : les chiffres s'affichent directement à leur valeur finale.\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : chiffre de 6 caractères au plus, tel qu'affiché (2007, 96%, 58) ; libellé de 70 caractères ; " +
          "note facultative en petit (source ou précision) ; l'animation n'agit que sur un chiffre qui commence par un nombre entier."
      },
      story: { height: "300px" }
    }
  },
  argTypes: {
    chiffres: {
      name: "Chiffres",
      control: "object",
      description:
        "Liste de 2 à 6 éléments `{ valeur, texte, note, animer }` : « Chiffre » (6 caractères, obligatoire), " +
        "« Libellé » (70 caractères, obligatoire), « Note (petit texte) », « Animer le chiffre » (vrai par défaut)."
    }
  }
};

// Bandeau de Notre démarche (src/_data/contenus/fr/notre_demarche.json).
export const NotreDemarche = {
  name: "Notre démarche",
  args: blocDe("notre_demarche", "chiffres_compteurs")
};

// Bandeau de Notre entreprise (src/_data/contenus/fr/notre_entreprise.json).
export const NotreEntreprise = {
  name: "Notre entreprise",
  args: blocDe("notre_entreprise", "chiffres_compteurs")
};
