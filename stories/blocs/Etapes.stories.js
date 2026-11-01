// Bloc « etapes » : src/_includes/composants/blocs/etapes.njk
// Champs : admin/config/blocs/etapes.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Méthode et étapes/Étapes ou processus",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("etapes", args, parameters.bloc),
  parameters: {
    ...PAGES.offre,
    docs: {
      description: {
        component:
          "Processus en 3 à 6 étapes numérotées (01, 02...) dans l'ordre de la liste, chacune avec une phase facultative. " +
          "Styles des pages d'offre (`logiciel-metier.css`).\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "sous-titre 40 mots ; chaque étape : phase d'un mot (Cadrage), titre de 40 caractères, texte de 30 mots. " +
          "Faire glisser une étape la renumérote."
      },
      story: { height: "600px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "40 mots maximum." },
    etapes: {
      name: "Étapes",
      control: "object",
      description: "De 3 à 6 éléments `{ phase, titre, texte }` : phase d'un mot, titre de 40 caractères et texte de 30 mots (obligatoires)."
    }
  }
};

// « Un accompagnement sur mesure » (src/_data/contenus/fr/logiciel_metier.json).
export const LogicielMetier = {
  name: "Page d'offre (Logiciel métier)",
  args: blocDe("logiciel_metier", "etapes")
};
