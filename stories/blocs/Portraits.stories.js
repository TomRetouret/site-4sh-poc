// Bloc « portraits » : src/_includes/composants/blocs/portraits.njk (feuille /assets/blocs.css)
// Champs : admin/config/blocs/portraits.yml.
import { rendreBloc, donnee } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDemo, PAGES } from "../../.storybook/4sh/contenus-site.js";

// Fiches de la collection Équipe (src/_data/equipe/*.json), lues par le filtre fichesEquipe.
const MEMBRES = ["christophe", "cyril", "damien", "frederic", "morgan"].filter((m) => donnee(`equipe/${m}`));

export default {
  title: "Blocs/Équipe/Équipe ou portraits",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("portraits", args, parameters.bloc),
  parameters: {
    ...PAGES.demo,
    docs: {
      description: {
        component:
          "Personnes choisies dans la collection Équipe (`src/_data/equipe/`) : **grille** (photo, nom et fonction, 4 par ligne) " +
          "ou **portrait unique** (la première personne, avec sa présentation). Photo, nom, fonction et présentation se " +
          "modifient dans la fiche de la personne ; une fiche supprimée est ignorée. Feuille propre `blocs.css`.\n\n" +
          "**Proposé sur** : pages d'offre, Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères ; titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; " +
          "sous-titre 40 mots ; de 1 à 12 personnes, dans l'ordre d'affichage.\n\n" +
          "Données : page de démonstration `src/demo/essai-blocs.md` (surtitres marqués « [DÉMO] »)."
      },
      story: { height: "560px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "40 mots maximum." },
    affichage: {
      name: "Affichage",
      control: "inline-radio",
      options: ["grille", "unique"],
      description: "`grille` : photo, nom et fonction (4 par ligne). `unique` : la première personne, avec sa présentation.",
      table: { defaultValue: { summary: "grille" } }
    },
    membres: {
      name: "Personnes",
      control: "check",
      options: MEMBRES,
      description: "De 1 à 12 fiches de la collection Équipe, dans l'ordre d'affichage."
    }
  }
};

// Grille de cinq personnes (src/demo/essai-blocs.md).
export const Grille = {
  name: "Grille de portraits",
  args: blocDemo("portraits", 0)
};

// Portrait unique avec présentation (src/demo/essai-blocs.md).
export const Unique = {
  name: "Portrait unique",
  args: blocDemo("portraits", 1)
};
