// Bloc « cartes_numerotees » : src/_includes/composants/blocs/cartes_numerotees.njk
// Champs : admin/config/blocs/cartes_numerotees.yml.
import { rendreBloc } from "../../.storybook/4sh/rendre-bloc.js";
import { blocDe, PAGES } from "../../.storybook/4sh/contenus-site.js";

export default {
  title: "Blocs/Cartes/Cartes numérotées",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("cartes_numerotees", args, parameters.bloc),
  parameters: {
    ...PAGES.institutionnel,
    docs: {
      description: {
        component:
          "Cartes numérotées automatiquement (1, 2, 3...) dans l'ordre de la liste, en grille ou en carrousel " +
          "(pratique au-delà de 6 cartes).\n\n" +
          "**Proposé sur** : Notre démarche, Notre entreprise / Company, pages de démonstration.\n\n" +
          "**Règles éditoriales** : surtitre 30 caractères (en carrousel, il nomme aussi le carrousel pour les lecteurs d'écran) ; " +
          "titre 60 caractères, un mot entre `*astérisques*` s'affiche en rouge ; sous-titre 50 mots ; de 2 à 12 cartes, " +
          "titre de 40 caractères et texte de 35 mots. « Coller au bloc précédent » retire l'espace au-dessus quand le bloc " +
          "précédent a le même fond blanc."
      },
      story: { height: "620px" }
    }
  },
  argTypes: {
    sans_marge_haute: {
      name: "Coller au bloc précédent",
      control: "boolean",
      description: "Supprime l'espace au-dessus du bloc, quand le bloc précédent a le même fond blanc."
    },
    surtitre: { name: "Surtitre", control: "text", description: "30 caractères maximum." },
    titre: { name: "Titre", control: "text", description: "Obligatoire, 60 caractères maximum. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text", description: "50 mots maximum." },
    affichage: {
      name: "Affichage",
      control: "inline-radio",
      options: ["grille", "carrousel"],
      description: "`grille` : toutes les cartes visibles. `carrousel` : les cartes défilent horizontalement.",
      table: { defaultValue: { summary: "grille" } }
    },
    colonnes: {
      name: "Colonnes (grille)",
      control: "inline-radio",
      options: ["auto", "2", "3", "4"],
      description: "Cartes par ligne sur grand écran, en grille. `auto` laisse la mise en page décider.",
      table: { defaultValue: { summary: "auto" } },
      if: { arg: "affichage", neq: "carrousel" }
    },
    cartes: {
      name: "Cartes",
      control: "object",
      description: "De 2 à 12 cartes `{ titre, texte }` : titre de 40 caractères, texte de 35 mots, les deux obligatoires."
    }
  }
};

// Démarche UX, grille de 3 colonnes (src/_data/contenus/fr/notre_demarche.json).
export const Grille = {
  name: "Grille, 3 par ligne",
  args: blocDe("notre_demarche", "cartes_numerotees", 0)
};

// Sept engagements en carrousel, même page.
export const Carrousel = {
  name: "Carrousel",
  args: blocDe("notre_demarche", "cartes_numerotees", 1)
};
