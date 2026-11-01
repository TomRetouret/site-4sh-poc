// Bloc « methode_4d » : src/_includes/composants/blocs/methode_4d.njk
// Champs : admin/config/blocs/methode_4d.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Méthode et étapes/Méthode 4D",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("methode_4d", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Les quatre étapes de la méthode 4D (Découvrir, Dessiner, Développer, Déployer) sur fond sombre. " +
          "Les étapes du premier bloc Méthode 4D de la page sont aussi reprises dans le hero expressif.\n\n" +
          "**Proposé sur** : accueil (français et anglais), pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre avec un mot entre `*astérisques*` pour l'afficher en rouge ; exactement 4 étapes " +
          "`{ numero, phase, titre, texte }`."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    etapes: {
      name: "Étapes",
      control: "object",
      description: "Exactement 4 éléments `{ numero, phase, titre, texte }`. Repris dans le haut de page (hero expressif)."
    }
  }
};

// Méthode de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "methode_4d")
};
