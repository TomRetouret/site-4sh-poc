// Bloc « cartes_offres » : src/_includes/composants/blocs/cartes_offres.njk
// Champs : admin/config/blocs/cartes_offres.yml.
import { rendreBloc, blocExemple } from "../../.storybook/4sh/rendre-bloc.js";

export default {
  title: "Blocs/Cartes/Cartes d'offres",
  tags: ["autodocs"],
  render: (args, { parameters }) => rendreBloc("cartes_offres", args, parameters.bloc),
  parameters: {
    docs: {
      description: {
        component:
          "Une à trois cartes, une par offre (4SH Build, Run, Learning ou institutionnel) : la couleur d'offre donne la teinte, " +
          "le picto et l'étiquette de la carte. Chaque carte porte des liens et un lien de bas de carte.\n\n" +
          "**Proposé sur** : accueil (français et anglais), pages de démonstration.\n\n" +
          "**Règles éditoriales** : titre avec un mot entre `*astérisques*` pour l'afficher en rouge ; de 1 à 3 cartes, " +
          "chacune avec couleur d'offre, titre et texte obligatoires."
      },
      story: { height: "720px" }
    }
  },
  argTypes: {
    surtitre: { name: "Surtitre", control: "text" },
    titre: { name: "Titre", control: "text", description: "Obligatoire. Un mot entre *astérisques* s'affiche en rouge." },
    sous_titre: { name: "Sous-titre", control: "text" },
    cartes: {
      name: "Cartes",
      control: "object",
      description:
        "De 1 à 3 cartes `{ offre, titre, texte, liens: [{ texte, lien }], lien_bas: { texte, lien } }`. " +
        "`offre` (« Couleur d'offre ») : build, run, learning ou institutionnel."
    }
  }
};

// Les trois offres de l'accueil (src/_data/contenus/fr/accueil.json).
export const Accueil = {
  name: "Accueil",
  args: blocExemple("accueil", "cartes_offres")
};

// Accueil anglais (src/_data/contenus/en/accueil.json) : libellés anglais des étiquettes.
export const AccueilAnglais = {
  name: "Accueil (anglais)",
  args: blocExemple("accueil", "cartes_offres", "en"),
  parameters: { bloc: { urlPage: "/en/" } }
};
