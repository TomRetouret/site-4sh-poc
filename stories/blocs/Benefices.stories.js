// Bloc « benefices » : src/_includes/composants/blocs/benefices.njk
// Champs : admin/config/blocs/benefices.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Cartes/Liste de bénéfices",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("benefices", args, parameters.bloc),
  parameters: {
    ...PAGES.offre,
    docs: {
      description: {
        component:
          "Liste de 3 à 6 bénéfices numérotés automatiquement dans l'ordre de la liste. Styles des pages d'offre " +
          "(`logiciel-metier.css`).\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "sous-titre 25 mots ; chaque bénéfice : titre de 40 caractères (obligatoire), texte de 20 mots."
      },
      story: { height: "560px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "25 mots maximum." },
    benefices: {
      name: "Bénéfices",
      control: "object",
      description: "De 3 à 6 éléments `{ titre, texte }` : titre de 40 caractères (obligatoire), texte de 20 mots."
    }
  }
};

// « Pourquoi choisir 4SH ? » (src/_data/contenus/fr/logiciel_metier.json).
export const LogicielMetier = {
  name: "Page d'offre (Logiciel métier)",
  args: blocDe("logiciel_metier", "benefices")
};
